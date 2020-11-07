import { IProjectResourceInfo } from '~defs/ProfileData';
import { pathJoin } from '~funcs/Files';
import { appEnv } from '~shell/base/AppEnvironment';
import { IProjectResourceInfoProvider } from '../serviceInterfaces';
import {
  IProjectResourceInfoSource,
  ProjectResourceInfoSourceLoader
} from './ProjectResourceInfoSourceLoader';

export class ProjectResourceInfoProvider
  implements IProjectResourceInfoProvider {
  projectInfoSources: IProjectResourceInfoSource[] = [];

  getAllProjectResourceInfos(): IProjectResourceInfo[] {
    return this.projectInfoSources.map((it) => {
      const {
        projectId,
        projectName,
        projectPath,
        hexFilePath,
        layoutFilePath,
        presetNames
      } = it;
      return {
        projectId,
        projectName,
        projectPath,
        presetNames,
        hasLayout: !!layoutFilePath,
        hasFirmwareBinary: !!hexFilePath
      };
    });
  }

  private getProjectInfoSourceById(
    projectId: string
  ): IProjectResourceInfoSource | undefined {
    return this.projectInfoSources.find((info) => info.projectId === projectId);
  }

  internal_getProjectInfoSourceById = this.getProjectInfoSourceById;

  getPresetProfileFilePath(
    projectId: string,
    presetName: string
  ): string | undefined {
    const info = this.getProjectInfoSourceById(projectId);
    const folder = info?.presetsFolderPath;
    return folder && pathJoin(folder, `${presetName}.json`);
  }

  getHexFilePath(projectId: string): string | undefined {
    const info = this.getProjectInfoSourceById(projectId);
    return info?.hexFilePath;
  }

  getLayoutFilePath(projectId: string): string | undefined {
    const info = this.getProjectInfoSourceById(projectId);
    return info?.layoutFilePath;
  }

  async initializeAsync(): Promise<void> {
    const resourceOrigin = appEnv.isDevelopment ? 'local' : 'central';
    this.projectInfoSources = await ProjectResourceInfoSourceLoader.loadProjectResourceInfoSources(
      resourceOrigin
    );
  }
}
