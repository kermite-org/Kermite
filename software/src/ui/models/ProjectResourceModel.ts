import { IProjectResourceInfo } from '~defs/ProfileData';
import { OneTimeNotifier } from '~funcs/OneTimeNotifier';
import { backendAgent } from '~ui/core';

export class ProjectResourceModel {
  projectResourceInfos: IProjectResourceInfo[] = [];
  loadCompletionNotifer = new OneTimeNotifier();

  initialize() {
    (async () => {
      this.projectResourceInfos = await backendAgent.getAllProjectResourceInfos();
      this.loadCompletionNotifer.notify();
    })();
  }
}
