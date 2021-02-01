import {
  IPersistKeyboardDesign,
  IProfileData,
  IProjectResourceInfo,
  IResourceOrigin,
} from '~/shared';
import { IProjectResourceProvider } from '~/shell/projects/interfaces';
import { ProjectResourceProviderImpl_Local } from './ProjectResourceProviderImpl_Local';

class ProjectResourceProvider implements IProjectResourceProvider {
  private projectResourceInfos: IProjectResourceInfo[] = [];

  localResourceProviderImpl = new ProjectResourceProviderImpl_Local();

  getAllProjectResourceInfos(): IProjectResourceInfo[] {
    return this.projectResourceInfos;
  }

  loadProjectPreset(
    origin: IResourceOrigin,
    projectId: string,
    presetName: string,
  ): Promise<IProfileData | undefined> {
    if (origin === 'local') {
      return this.localResourceProviderImpl.loadProjectPreset(
        projectId,
        presetName,
      );
    } else {
      throw 'unimplemented';
    }
  }

  loadProjectLayout(
    origin: IResourceOrigin,
    projectId: string,
    layoutName: string,
  ): Promise<IPersistKeyboardDesign | undefined> {
    if (origin === 'local') {
      return this.localResourceProviderImpl.loadProjectLayout(
        projectId,
        layoutName,
      );
    } else {
      throw 'unimplemented';
    }
  }

  loadProjectFirmwareFile(
    origin: IResourceOrigin,
    projectId: string,
  ): Promise<string | undefined> {
    if (origin === 'local') {
      return this.localResourceProviderImpl.loadProjectFirmwareFile(projectId);
    } else {
      throw 'unimplemented';
    }
  }

  // internal_getProjectInfoSourceById(
  //   projectId: string,
  // ): IProjectResourceInfoSource | undefined {

  // }
  // private getProjectInfoSourceById(
  //   projectId: string,
  // ): IProjectResourceInfoSource | undefined {
  //   return this.projectInfoSources.find((info) => info.projectId === projectId);
  // }

  //   // throw new Error('Method not implemented.');
  // }

  // patchLocalProjectInfoSource(
  //   projectId: string,
  //   callback: (info: IProjectResourceInfoSource) => void,
  // ): void {
  //   throw new Error('Method not implemented.');
  // }

  async reenumerateResourceInfos(): Promise<void> {
    this.projectResourceInfos = await this.localResourceProviderImpl.loadAllProjectResourceInfos();
  }

  async initializeAsync(): Promise<void> {
    await this.reenumerateResourceInfos();
  }
}

export const projectResourceProvider = new ProjectResourceProvider();
