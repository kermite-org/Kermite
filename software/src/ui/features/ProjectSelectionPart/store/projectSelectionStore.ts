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
  showAllPackagesForNonDeveloperMode: true,
};

type IState = {
  tabResourceOrigin: IResourceOrigin;
};

const state: IState = {
  tabResourceOrigin: 'online',
};

const helpers = {
  createSourceProjectItems(
    allProjectPackageInfos: IProjectPackageInfo[],
    resourceOrigin: IResourceOrigin,
    namePrefix: string = '',
  ): IProjectKeyboardListProjectItem[] {
    const filteredProjects = allProjectPackageInfos.filter(
      (info) => info.origin === resourceOrigin,
    );
    filteredProjects.sort(
      sortOrderBy((it) => (it.isDraft ? '' : it.keyboardName)),
    );
    return filteredProjects.map((info) => ({
      projectId: info.projectId,
      projectKey: info.projectKey,
      keyboardName: info.isDraft
        ? `${namePrefix}(draft)${info.keyboardName}`
        : `${namePrefix}${info.keyboardName}`,
      design: DisplayKeyboardDesignLoader.loadDisplayKeyboardDesign(
        info.layouts[0]?.data || createFallbackPersistKeyboardDesign(),
      ),
    }));
  },
  createSourceProjectItemsWrapped(
    allProjectPackageInfos: IProjectPackageInfo[],
    resourceOrigin: IResourceOrigin,
    isDeveloperMode: boolean,
  ): IProjectKeyboardListProjectItem[] {
    if (configs.showAllPackagesForNonDeveloperMode && !isDeveloperMode) {
      const onlineProjects = helpers.createSourceProjectItems(
        allProjectPackageInfos,
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
