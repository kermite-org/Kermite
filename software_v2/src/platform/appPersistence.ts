import {
  IProjectPackage,
  localStorageHelper_readItemSafe,
  localStorageHelper_writeItem,
} from '~/app-shared';
import { appStore } from './appStore';

type IAppPersistData = {
  project: IProjectPackage;
};

function createAppPersistence() {
  const storageKey = 'kermite-app-data';
  return {
    load() {
      const obj = localStorageHelper_readItemSafe<IAppPersistData>(storageKey);
      if (obj) {
        appStore.actions.loadProject(obj.project);
      }
    },
    save() {
      localStorageHelper_writeItem<IAppPersistData>(storageKey, {
        project: appStore.state.currentProject,
      });
    },
  };
}

export const appPersistence = createAppPersistence();
