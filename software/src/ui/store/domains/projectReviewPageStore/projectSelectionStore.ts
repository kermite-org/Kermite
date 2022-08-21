import {
  createProjectKey,
  DisplayKeyboardDesignLoader,
  fallbackProjectPackageInfo,
  IProjectPackageInfo,
} from '~/shared';
import { IProjectKeyboardListProjectItem } from '~/ui/base';
import { projectPackagesReader, uiReaders } from '~/ui/store';

export type IProjectSelectionStore = {
  projectItems: IProjectKeyboardListProjectItem[];
  currentProjectKey: string;
  selectedProjectInfo: IProjectPackageInfo;
  setCurrentProjectKey: (key: string) => void;
};

export function createProjectSelectionStore(): IProjectSelectionStore {
  function loadProjectItems(): IProjectKeyboardListProjectItem[] {
    return uiReaders.allProjectPackageInfos
      .filter((info) => info.origin === 'online_suspend')
      .map((info) => ({
        projectKey: createProjectKey(info.origin, info.projectId),
        keyboardName: `(suspend)${info.keyboardName}`,
        design: DisplayKeyboardDesignLoader.loadDisplayKeyboardDesign(
          info.layouts[0].data,
        ),
        onlineProjectAttrs: info.onlineProjectAttributes,
      }));
  }
  let loadedProjectItems: IProjectKeyboardListProjectItem[] | undefined;

  const state = {
    currentProjectKey: '',
  };

  return {
    get projectItems() {
      return (loadedProjectItems ||= loadProjectItems());
    },
    get currentProjectKey() {
      return state.currentProjectKey;
    },
    get selectedProjectInfo() {
      return (
        projectPackagesReader.findProjectInfoByProjectKey(
          state.currentProjectKey,
        ) || fallbackProjectPackageInfo
      );
    },
    setCurrentProjectKey(value: string) {
      state.currentProjectKey = value;
    },
  };
}
