import { FSWatcher } from 'fs';
import {
  fsIsFileExists,
  fsxWtachFilesChange,
  pathDirName,
  pathRelative,
  pathResolve
} from '~funcs/Files';
import { removeArrayItems } from '~funcs/Utils';
import { appEnv } from '~shell/base/AppEnvironment';
import { IFileUpdationListener } from './KeyboardShapesProvider';

export class KeyboardLayoutFilesWatcher {
  private listeners: IFileUpdationListener[] = [];

  private baseDir = pathResolve('../firmware/src/projects');

  private watcher: FSWatcher | undefined;

  fileUpdationEvents = {
    subscribe: (listener: IFileUpdationListener) => {
      this.listeners.push(listener);
    },

    unsubscribe: (listener: IFileUpdationListener) => {
      removeArrayItems(this.listeners, listener);
    }
  };

  onFileUpdated = async (filePath: string) => {
    if (filePath.endsWith('/layout.json')) {
      const breedName = pathRelative(this.baseDir, pathDirName(filePath));
      this.listeners.forEach((listener) => listener({ breedName }));
    }
  };

  initialize() {
    if (appEnv.isDevelopment) {
      if (fsIsFileExists(this.baseDir)) {
        this.watcher = fsxWtachFilesChange(this.baseDir, this.onFileUpdated);
      }
    }
  }

  terminate() {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = undefined;
    }
  }
}
