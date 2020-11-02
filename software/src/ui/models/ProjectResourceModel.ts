import { IProjectResourceInfo } from '~defs/ProfileData';
import { backendAgent } from '~ui/core';

export class ProjectResourceModel {
  projectResourceInfos: IProjectResourceInfo[] = [];

  initialize() {
    (async () => {
      this.projectResourceInfos = await backendAgent.getAllProjectResourceInfos();
    })();
  }
}
