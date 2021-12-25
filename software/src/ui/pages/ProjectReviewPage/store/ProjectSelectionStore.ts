import { createProjectKey, DisplayKeyboardDesignLoader } from '~/shared';
import { IProjectKeyboardListProjectItem } from '~/ui/base';
import { uiReaders } from '~/ui/store';

export type IProjectSelectionStore = {
  projectItems: IProjectKeyboardListProjectItem[];
  currentProjectKey: string;
  setCurrentProjectKey: (key: string) => void;
};

export function createProjectSelectionStore(): IProjectSelectionStore {
  const projectItems = uiReaders.allProjectPackageInfos
    .filter((info) => info.origin === 'online_audit')
    .map((info) => ({
      projectKey: createProjectKey(info.origin, info.projectId),
      keyboardName: `(review)${info.keyboardName}`,
      design: DisplayKeyboardDesignLoader.loadDisplayKeyboardDesign(
        info.layouts[0].data,
      ),
      onlineProjectAttrs: info.onlineProjectAttributes,
    }));

  const state = {
    currentProjectKey: '',
  };

  return {
    projectItems,
    get currentProjectKey() {
      return state.currentProjectKey;
    },
    setCurrentProjectKey(value: string) {
      state.currentProjectKey = value;
    },
  };
}
