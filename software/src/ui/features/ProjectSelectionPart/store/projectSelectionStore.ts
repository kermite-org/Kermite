import {
  createFallbackPersistKeyboardDesign,
  DisplayKeyboardDesignLoader,
  getOriginAndProjectIdFromProjectKey,
  IProjectPackageInfo,
  IResourceOrigin,
  sortOrderBy,
} from '~/shared';
import { featureFlags } from '~/shared/defs/FeatureFlags';
import { IProjectKeyboardListProjectItem } from '~/ui/base';
import { globalSettingsWriter, uiReaders } from '~/ui/store/base';
import { createSimpleSelector2 } from '~/ui/utils';

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
        ? `(draft)${info.keyboardName}`
        : info.keyboardName,
      design: DisplayKeyboardDesignLoader.loadDisplayKeyboardDesign(
        info.layouts[0]?.data || createFallbackPersistKeyboardDesign(),
      ),
    }));
  },
};

const sourceProjectItemsSelector = createSimpleSelector2(
  helpers.createSourceProjectItems,
  () => [uiReaders.allProjectPackageInfos, state.tabResourceOrigin],
);

const readers = {
  get tabResourceOrigin(): IResourceOrigin {
    return state.tabResourceOrigin;
  },
  get canSelectResourceOrigin(): boolean {
    return featureFlags.allowEditLocalProject && uiReaders.isDeveloperMode;
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
