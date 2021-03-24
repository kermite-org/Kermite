import {
  IPersistKeyboardDesign,
  IProfileData,
  IProjectCustomDefinition,
  IProjectResourceInfo,
  IResourceOrigin,
} from '~/shared';
import { ProjectResourceProviderImpl_Remote } from '~/shell/projectResources/ProjectResourceProviderImpl_Remote';
import {
  IFirmwareBinaryFileSpec,
  IProjectResourceProvider,
  IProjectResourceProviderImpl,
} from '~/shell/projectResources/interfaces';
import { ProjectResourceProviderImpl_Local } from './ProjectResourceProviderImpl_Local';

class ProjectResourceProvider implements IProjectResourceProvider {
  localResourceProviderImpl = new ProjectResourceProviderImpl_Local();
  remoteResourceProviderImpl = new ProjectResourceProviderImpl_Remote();

  async getAllProjectResourceInfos(): Promise<IProjectResourceInfo[]> {
    const locals = await this.localResourceProviderImpl.getAllProjectResourceInfos();
    const remotes = await this.remoteResourceProviderImpl.getAllProjectResourceInfos();
    return [...locals, ...remotes];
  }

  private getResouceProviderImpl(
    origin: IResourceOrigin,
  ): IProjectResourceProviderImpl {
    if (origin === 'local') {
      return this.localResourceProviderImpl;
    } else {
      return this.remoteResourceProviderImpl;
    }
  }

  async getProjectCustomDefinition(
    origin: IResourceOrigin,
    projectId: string,
    variationName: string,
  ): Promise<IProjectCustomDefinition | undefined> {
    const providerImpl = this.getResouceProviderImpl(origin);
    return await providerImpl.getProjectCustomDefinition(
      projectId,
      variationName,
    );
  }

  async loadProjectPreset(
    origin: IResourceOrigin,
    projectId: string,
    presetName: string,
  ): Promise<IProfileData | undefined> {
    const providerImpl = this.getResouceProviderImpl(origin);
    return await providerImpl.loadProjectPreset(projectId, presetName);
  }

  async loadProjectLayout(
    origin: IResourceOrigin,
    projectId: string,
    layoutName: string,
  ): Promise<IPersistKeyboardDesign | undefined> {
    const providerImpl = this.getResouceProviderImpl(origin);
    return await providerImpl.loadProjectLayout(projectId, layoutName);
  }

  async loadProjectFirmwareFile(
    origin: IResourceOrigin,
    projectId: string,
    variationName: string,
  ): Promise<IFirmwareBinaryFileSpec | undefined> {
    const providerImpl = this.getResouceProviderImpl(origin);
    return await providerImpl.loadProjectFirmwareFile(projectId, variationName);
  }
}

export const projectResourceProvider = new ProjectResourceProvider();
