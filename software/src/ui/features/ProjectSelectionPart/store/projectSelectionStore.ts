import {
  createFallbackPersistKeyboardDesign,
  DisplayKeyboardDesignLoader,
  getOriginAndProjectIdFromProjectKey,
  IProjectPackageInfo,
  IResourceOrigin,
  sortOrderBy,
} from '~/shared';
import { IProjectKeyboardListProjectItem } from '~/ui/base';
import { globalSettingsWriter, uiReaders } from '~/ui/store/base';
import { createSimpleSelector2 } from '~/ui/utils';

const configs = {
  showLocalPackagesForNonDeveloperMode: true,
};

type IState = {
  tabResourceOrigin: IResourceOrigin;
};

const state: IState = {
  tabResourceOrigin: 'online',
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
  ): IProjectKeyboardListProjectItem[] {
    if (configs.showLocalPackagesForNonDeveloperMode && !isDeveloperMode) {
      const onlineProjects = helpers.createSourceProjectItems(
        allProjectPackageInfos.filter(
          (it) => !it.onlineProjectAttributes?.isDevelopment,
        ),
        'online',
      );
      const localProjects = helpers.createSourceProjectItems(
        allProjectPackageInfos.filter((it) => !it.isDraft),
        'local',
        '(local)',
      );
      return [...onlineProjects, ...localProjects];
    } else {
      return helpers.createSourceProjectItems(
        allProjectPackageInfos,
        resourceOrigin,
      );
    }
  },
};

const sourceProjectItemsSelector = createSimpleSelector2(
  helpers.createSourceProjectItemsWrapped,
  () => [
    uiReaders.allProjectPackageInfos,
    state.tabResourceOrigin,
    uiReaders.isDeveloperMode,
  ],
);

const readers = {
  get tabResourceOrigin(): IResourceOrigin {
    return state.tabResourceOrigin;
  },
  get canSelectResourceOrigin(): boolean {
    return uiReaders.isDeveloperMode;
  },
  get sourceProjectItems(): IProjectKeyboardListProjectItem[] {
    return sourceProjectItemsSelector();
  },
};

const actions = {
  setTabResourceOrigin(origin: IResourceOrigin) {
    state.tabResourceOrigin = origin;
  },
  resetState() {
    if (!readers.canSelectResourceOrigin) {
      state.tabResourceOrigin = 'online';
    } else {
      if (uiReaders.globalProjectOrigin) {
        state.tabResourceOrigin = uiReaders.globalProjectOrigin;
      }
    }
  },
  setProjectKey(projectKey: string) {
    const projectSpec =
      (projectKey && getOriginAndProjectIdFromProjectKey(projectKey)) ||
      undefined;
    globalSettingsWriter.writeValue('globalProjectSpec', projectSpec);
  },
};

export const projectSelectionStore = {
  readers,
  actions,
};
