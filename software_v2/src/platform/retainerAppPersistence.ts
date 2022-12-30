import {
  IProjectPackage,
  localStorageHelper_readItemSafe,
  localStorageHelper_writeItem,
} from '~/app-shared';
import { appStore } from './appStore';

type IAppPersistData = {
  currentProject: IProjectPackage;
  editorTargetPath: string | undefined;
};

function createAppPersistence() {
  const storageKey = 'kermite-app-data';
  return {
    load() {
      const obj = localStorageHelper_readItemSafe<IAppPersistData>(storageKey);
      if (obj) {
        if (obj.currentProject) {
          appStore.actions.loadProject(obj.currentProject);
        }
        appStore.actions.setEditorTargetPath(obj.editorTargetPath);
      }
    },
    save() {
      const { currentProject, editorTargetPath } = appStore.state;
      localStorageHelper_writeItem<IAppPersistData>(storageKey, {
        currentProject,
        editorTargetPath,
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
