import { IProjectResourceInfo } from '~defs/ProfileData';
import { backendAgent } from '~ui/core';

class ProjectResourceModel {
  projectResourceInfos: IProjectResourceInfo[] = [];

  initialize() {
    (async () => {
      this.projectResourceInfos = await backendAgent.getAllProjectResourceInfos();
    })();
  }
}
export const projectResourceModel = new ProjectResourceModel();
