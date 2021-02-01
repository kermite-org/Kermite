import { IProjectResourceInfo } from '~/shared';
import { ipcAgent } from '~/ui-common';

export class ProjectResourceModel {
  projectResourceInfos: IProjectResourceInfo[] = [];

  getProjectsWithLayout() {
    return this.projectResourceInfos.filter(
      (info) => info.layoutNames.length > 0,
    );
  }

  getProjectsWithFirmware() {
    return this.projectResourceInfos.filter((info) => info.hasFirmwareBinary);
  }

  getProjectResourceInfo(projectSig: string) {
    return this.projectResourceInfos.find((info) => info.sig === projectSig);
  }

  async initializeAsync() {
    this.projectResourceInfos = await ipcAgent.async.projects_getAllProjectResourceInfos();
  }

  refetchResourceInfos() {
    this.initializeAsync();
  }
}
export const projectResourceModel = new ProjectResourceModel();
