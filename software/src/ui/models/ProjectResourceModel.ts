import { IProjectResourceInfo } from '~defs/ProfileData';
import { OneTimeNotifier } from '~funcs/OneTimeNotifier';
import { backendAgent } from '~ui/core';

export class ProjectResourceModel {
  projectResourceInfos: IProjectResourceInfo[] = [];
  loadedNotifier = new OneTimeNotifier();

  getProjectsWithLayout() {
    return this.projectResourceInfos.filter((info) => info.hasLayout);
  }

  initialize() {
    (async () => {
      this.projectResourceInfos = await backendAgent.getAllProjectResourceInfos();
      this.loadedNotifier.notify();
    })();
  }
}
