import {
  IPersistKeyboardDesign,
  IProfileData,
  IProjectResourceInfo,
  IResourceOrigin,
} from '~/shared';
import { ProjectResourceProviderImpl_Remote } from '~/shell/projects/ProjectResourceProviderImpl_Remote';
import {
  IProjectResourceProvider,
  IProjectResourceProviderImpl,
} from '~/shell/projects/interfaces';
import { ProjectResourceProviderImpl_Local } from './ProjectResourceProviderImpl_Local';

class ProjectResourceProvider implements IProjectResourceProvider {
  private projectResourceInfos: IProjectResourceInfo[] = [];

  localResourceProviderImpl = new ProjectResourceProviderImpl_Local();
  remoteResourceProviderImpl = new ProjectResourceProviderImpl_Remote();

  getAllProjectResourceInfos(): IProjectResourceInfo[] {
    return this.projectResourceInfos;
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

  loadProjectPreset(
    origin: IResourceOrigin,
    projectId: string,
    presetName: string,
  ): Promise<IProfileData | undefined> {
    const providerImpl = this.getResouceProviderImpl(origin);
    return providerImpl.loadProjectPreset(projectId, presetName);
  }

  loadProjectLayout(
    origin: IResourceOrigin,
    projectId: string,
    layoutName: string,
  ): Promise<IPersistKeyboardDesign | undefined> {
    const providerImpl = this.getResouceProviderImpl(origin);
    return providerImpl.loadProjectLayout(projectId, layoutName);
  }

  loadProjectFirmwareFile(
    origin: IResourceOrigin,
    projectId: string,
  ): Promise<string | undefined> {
    const providerImpl = this.getResouceProviderImpl(origin);
    return providerImpl.loadProjectFirmwareFile(projectId);
  }

  async reenumerateResourceInfos(): Promise<void> {
    const locals = await this.localResourceProviderImpl.loadAllProjectResourceInfos();
    const remotes = await this.remoteResourceProviderImpl.loadAllProjectResourceInfos();
    this.projectResourceInfos = [...locals, ...remotes];
  }

  async initializeAsync(): Promise<void> {
    await this.reenumerateResourceInfos();
  }
}

export const projectResourceProvider = new ProjectResourceProvider();
