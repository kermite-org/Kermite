import { IProjectResourceInfo } from '@kermite/shared';
import { ipcAgent } from '@kermite/ui';

export class ProjectResourceModel {
  projectResourceInfos: IProjectResourceInfo[] = [];

  getProjectsWithLayout() {
    return this.projectResourceInfos.filter((info) => info.hasLayout);
  }

  getProjectsWithFirmware() {
    return this.projectResourceInfos.filter((info) => info.hasFirmwareBinary);
  }

  getProjectResourceInfo(projectId: string) {
    return this.projectResourceInfos.find(
      (info) => info.projectId === projectId,
    );
  }

  async initializeAsync() {
    this.projectResourceInfos = await ipcAgent.async.projects_getAllProjectResourceInfos();
  }
}
