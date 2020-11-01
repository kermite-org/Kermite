import { IProjectResourceInfo } from '~defs/ProfileData';
import { backendAgent } from '~ui/core';

class ProjectResourceModel {
  projectResourceInfos: IProjectResourceInfo[] = [];

  async initialize() {
    this.projectResourceInfos = await backendAgent.getAllProjectResourceInfos();
  }
}
export const projectResourceModel = new ProjectResourceModel();
