import { FSWatcher } from 'fs';
import { appEnv } from '~/shell/base';
import {
  pathResolve,
  EventPort,
  pathRelative,
  pathDirname,
  fsExistsSync,
  fsxWatchFilesChange,
} from '~/shell/funcs';
import { IProjectResourceInfoProvider } from '~/shell/services/serviceInterfaces';

type IFileUpdationEvent = { projectId: string };

export class KeyboardLayoutFilesWatcher {
  private baseDir = pathResolve('../firmware/src/projects');

  private watcher: FSWatcher | undefined;

  readonly fileUpdationEventPort = new EventPort<IFileUpdationEvent>();

  constructor(
    private projectResourceInfoProvider: IProjectResourceInfoProvider,
  ) {}

  private getProjectIdFromFilePath(projectPath: string) {
    const infos = this.projectResourceInfoProvider.getAllProjectResourceInfos();
    const info = infos.find((info) => info.projectPath === projectPath);
    return info?.projectId;
  }

  private onFileUpdated = async (filePath: string) => {
    if (filePath.endsWith('/layout.json')) {
      const projectPath = pathRelative(this.baseDir, pathDirname(filePath));
      const projectId = this.getProjectIdFromFilePath(projectPath);
      if (projectId) {
        this.fileUpdationEventPort.emit({ projectId });
      }
    }
  };

  initialize() {
    if (appEnv.isDevelopment) {
      if (fsExistsSync(this.baseDir)) {
        this.watcher = fsxWatchFilesChange(this.baseDir, this.onFileUpdated);
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
