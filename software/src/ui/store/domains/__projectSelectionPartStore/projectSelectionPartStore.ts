import {
  createFallbackPersistKeyboardDesign,
  DisplayKeyboardDesignLoader,
  getOriginAndProjectIdFromProjectKey,
  IProjectPackageInfo,
  IResourceOrigin,
  sortOrderBy,
} from '~/shared';
import {
  IGeneralMenuItem,
  IProjectKeyboardListProjectItem,
  ISelectorSource,
  makePlainSelectorOption,
} from '~/ui/base';
import { globalSettingsWriter, uiReaders } from '~/ui/store/base';
import { createProjectManagementMenuItems } from '~/ui/store/domains/ProjectSelectionPartStore/ProjectManagementMenuModel';
import { createSimpleSelector2 } from '~/ui/utils';

type IState = {
  tabResourceOrigin: IResourceOrigin;
};

type IReaders = {
  sourceProjectItems: IProjectKeyboardListProjectItem[];
  projectKey: string;
  canSelectResourceOrigin: boolean;
  resourceOriginSelectorSource: ISelectorSource;
  isMenuButtonVisible: boolean;
  menuItems: IGeneralMenuItem[];
  showNoSelectionOption: boolean;
};

type IActions = {
  setProjectKey(projectKey: string): void;
};

type IProjectSelectionPartStore = {
  readers: IReaders;
  actions: IActions;
  initializeOnMount(): void;
};

const helpers = {
  getProjectItemPrefix(info: IProjectPackageInfo) {
    if (info.origin === 'online_audit') {
      return '(review)';
    }
    if (info.isDraft) {
      return '(draft)';
    }
    return '';
  },
  createSourceProjectItems(
    allProjectPackageInfos: IProjectPackageInfo[],
    targetResourceOrigin: IResourceOrigin,
    namePrefix: string = '',
  ): IProjectKeyboardListProjectItem[] {
    const filteredProjects = allProjectPackageInfos.filter(
      (info) => info.origin === targetResourceOrigin,
      // info.origin.startsWith(targetResourceOrigin),
    );
    filteredProjects.sort(
      sortOrderBy((it) => (it.isDraft ? '' : it.keyboardName)),
    );
    return filteredProjects.map((info) => ({
      projectId: info.projectId,
      projectKey: info.projectKey,
      keyboardName: `${namePrefix}${this.getProjectItemPrefix(info)}${
        info.keyboardName
      }`,
      design: DisplayKeyboardDesignLoader.loadDisplayKeyboardDesign(
        info.layouts[0]?.data || createFallbackPersistKeyboardDesign(),
      ),
      onlineProjectAttrs: info.onlineProjectAttributes,
    }));
  },
  createSourceProjectItemsWrapped(
    allProjectPackageInfos: IProjectPackageInfo[],
    resourceOrigin: IResourceOrigin,
    isDeveloperMode: boolean,
    showDevelopmentPackages: boolean,
  ): IProjectKeyboardListProjectItem[] {
    let targetProjectPackages = allProjectPackageInfos;
    if (!(isDeveloperMode && showDevelopmentPackages)) {
      targetProjectPackages = targetProjectPackages.filter(
        (it) => !it.onlineProjectAttributes?.isDevelopment,
      );
    }
    if (!isDeveloperMode) {
      const onlineProjects = helpers.createSourceProjectItems(
        targetProjectPackages.filter(
          (it) => !it.onlineProjectAttributes?.isDevelopment,
        ),
        'online',
      );
      const localProjects = helpers.createSourceProjectItems(
        targetProjectPackages.filter((it) => !it.isDraft),
        'local',
        '(local)',
      );
      return [...onlineProjects, ...localProjects];
    } else {
      return helpers.createSourceProjectItems(
        targetProjectPackages,
        resourceOrigin,
      );
    }
  },
};

function createProjectSelectionPartStore(): IProjectSelectionPartStore {
  const state: IState = {
    tabResourceOrigin: 'online',
  };

  const sourceProjectItemsSelector = createSimpleSelector2(
    helpers.createSourceProjectItemsWrapped,
    () => [
      uiReaders.allProjectPackageInfos,
      state.tabResourceOrigin,
      uiReaders.isDeveloperMode,
      uiReaders.globalSettings.showDevelopmentPackages,
    ],
  );

  const readers: IReaders = {
    get canSelectResourceOrigin() {
      return uiReaders.isDeveloperMode;
    },
    get sourceProjectItems() {
      return sourceProjectItemsSelector();
    },
    get projectKey() {
      return uiReaders.globalProjectKey;
    },
    get resourceOriginSelectorSource() {
      return {
        options: ['local', 'online'].map(makePlainSelectorOption),
        value: state.tabResourceOrigin,
        setValue: actions.setTabResourceOrigin,
      };
    },
    get isMenuButtonVisible() {
      return state.tabResourceOrigin === 'local';
    },
    get menuItems() {
      return createProjectManagementMenuItems();
    },
    get showNoSelectionOption() {
      return true;
    },
  };

  const actions = {
    setTabResourceOrigin(origin: IResourceOrigin) {
      state.tabResourceOrigin = origin;
    },
    setProjectKey(projectKey: string) {
      const projectSpec =
        (projectKey && getOriginAndProjectIdFromProjectKey(projectKey)) ||
        undefined;
      globalSettingsWriter.writeValue('globalProjectSpec', projectSpec);
    },
  };

  const initializeOnMount = () => {
    if (!readers.canSelectResourceOrigin) {
      state.tabResourceOrigin = 'online';
    } else {
      if (uiReaders.globalProjectOrigin) {
        state.tabResourceOrigin = uiReaders.globalProjectOrigin;
      }
    }
  };

  return {
    readers,
    actions,
    initializeOnMount,
  };
}

export const projectSelectionPartStore = createProjectSelectionPartStore();
