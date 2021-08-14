import { FSWatcher } from 'fs';
import { appEnv } from '~/shell/base';
import {
  pathResolve,
  pathRelative,
  pathDirname,
  fsExistsSync,
  fsxWatchFilesChange,
  createEventPort,
} from '~/shell/funcs';
import { projectResourceProvider } from '~/shell/projectResources';

type IFileUpdationEvent = { projectId: string };

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class KeyboardLayoutFilesWatcher_OBSOLETE {
  private baseDir = pathResolve('../firmware/src/projects');

  private watcher: FSWatcher | undefined;

  fileUpdationEvents = createEventPort<IFileUpdationEvent>({
    onFirstSubscriptionStarting: () => this.initializeWatcher(),
    onLastSubscriptionEnded: () => this.terminateWatcher(),
  });

  private initializeWatcher() {
    if (appEnv.isDevelopment) {
      if (fsExistsSync(this.baseDir)) {
        this.watcher = fsxWatchFilesChange(this.baseDir, this.onFileUpdated);
      }
    }
  }

  private terminateWatcher() {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = undefined;
    }
  }

  private async getProjectIdFromFilePath(projectPath: string) {
    const infos = await projectResourceProvider.getAllProjectResourceInfos();
    const info = infos.find((info) => info.projectPath === projectPath);
    return info?.projectId;
  }

  private onFileUpdated = async (filePath: string) => {
    if (filePath.endsWith('.layout.json')) {
      const projectPath = pathRelative(this.baseDir, pathDirname(filePath));
      const projectId = await this.getProjectIdFromFilePath(projectPath);
      if (projectId) {
        this.fileUpdationEvents.emit({ projectId });
      }
    }
  };
}
