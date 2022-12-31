import {
  IProjectPackage,
  localStorageHelper_readItemSafe,
  localStorageHelper_writeItem,
} from '~/app-shared';
import { appStore } from './appStore';
import { deviceStore } from './deviceStore';

type IAppPersistData = {
  currentProject: IProjectPackage;
  editorTargetPath: string | undefined;
  targetDeviceProductName: string | undefined;
};

function createAppPersistence() {
  const storageKey = 'kermite-app-data';
  return {
    load() {
      const data = localStorageHelper_readItemSafe<IAppPersistData>(storageKey);
      if (data) {
        if (data.currentProject) {
          appStore.actions.loadProject(data.currentProject);
        }
        appStore.actions.setEditorTargetPath(data.editorTargetPath);
        if (data.targetDeviceProductName) {
          deviceStore.state.targetDeviceProductName =
            data.targetDeviceProductName;
        }
      }
    },
    save() {
      const { currentProject, editorTargetPath } = appStore.state;
      const { targetDeviceProductName } = deviceStore.state;
      localStorageHelper_writeItem<IAppPersistData>(storageKey, {
        currentProject,
        editorTargetPath,
        targetDeviceProductName,
      });
    },
  };
}

export function setupRetainerAppPersistence() {
  const appPersistence = createAppPersistence();
  appPersistence.load();
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      appPersistence.save();
    }
  });
}
