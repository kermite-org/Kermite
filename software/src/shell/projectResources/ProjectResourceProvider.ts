import {
  IPersistKeyboardDesign,
  IProjectCustomDefinition,
  IProjectResourceInfo,
  IResourceOrigin,
} from '~/shared';
import {
  IProjectResourceProvider,
  IProjectResourceProviderImpl,
} from '~/shell/projectResources/Interfaces';
import { ProjectResourceProviderImpl_Local } from '~/shell/projectResources/ProjectResourceProviderImpl_Local';
import { ProjectResourceProviderImpl_Remote } from '~/shell/projectResources/ProjectResourceProviderImpl_Remote';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class ProjectResourceProvider_OBSOLETE implements IProjectResourceProvider {
  localResourceProviderImpl = new ProjectResourceProviderImpl_Local();
  remoteResourceProviderImpl = new ProjectResourceProviderImpl_Remote();

  // eslint-disable-next-line @typescript-eslint/require-await
  async getAllProjectResourceInfos(): Promise<IProjectResourceInfo[]> {
    // const locals = await this.localResourceProviderImpl.getAllProjectResourceInfos();
    // const remotes = await this.remoteResourceProviderImpl.getAllProjectResourceInfos();
    // const allResourceInfos = [...locals, ...remotes];
    // return allResourceInfos.sort(
    //   sortOrderBy((it) => `${it.origin}${it.keyboardName}${it.projectPath}`),
    // );
    return [];
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

  // async loadProjectPreset(
  //   origin: IResourceOrigin,
  //   projectId: string,
  //   presetName: string,
  // ): Promise<IProfileData | undefined> {
  //   // const providerImpl = this.getResouceProviderImpl(origin);
  //   // return await providerImpl.loadProjectPreset(projectId, presetName);
  //   return undefined;
  // }

  async loadProjectLayout(
    origin: IResourceOrigin,
    projectId: string,
    layoutName: string,
  ): Promise<IPersistKeyboardDesign | undefined> {
    const providerImpl = this.getResouceProviderImpl(origin);
    return await providerImpl.loadProjectLayout(projectId, layoutName);
  }

  // async loadProjectFirmwareFile(
  //   origin: IResourceOrigin,
  //   projectId: string,
  //   variationName: string,
  // ): Promise<IFirmwareBinaryFileSpec | undefined> {
  //   const providerImpl = this.getResouceProviderImpl(origin);
  //   return await providerImpl.loadProjectFirmwareFile(projectId, variationName);
  // }
}
