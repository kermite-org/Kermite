import { FSWatcher } from 'fs';
import { EventPort } from '~funcs/EventPort';
import {
  fsIsFileExists,
  fsxWtachFilesChange,
  pathDirName,
  pathRelative,
  pathResolve
} from '~funcs/Files';
import { appEnv } from '~shell/base/AppEnvironment';

type IFileUpdationEvent = { breedName: string };

export class KeyboardLayoutFilesWatcher {
  private baseDir = pathResolve('../firmware/src/projects');

  private watcher: FSWatcher | undefined;

  readonly fileUpdationEventPort = new EventPort<IFileUpdationEvent>();

  private onFileUpdated = async (filePath: string) => {
    if (filePath.endsWith('/layout.json')) {
      const breedName = pathRelative(this.baseDir, pathDirName(filePath));
      this.fileUpdationEventPort.emit({ breedName });
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
