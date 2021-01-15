import { IProjectResourceInfo } from '@shared';
import { appEnv } from '~/base';
import { pathJoin } from '~/funcs';
import { IProjectResourceInfoProvider } from '../serviceInterfaces';
import {
  IProjectResourceInfoSource,
  ProjectResourceInfoSourceLoader,
} from './ProjectResourceInfoSourceLoader';

export class ProjectResourceInfoProvider
  implements IProjectResourceInfoProvider {
  projectInfoSources: IProjectResourceInfoSource[] = [];

  getAllProjectResourceInfos(): IProjectResourceInfo[] {
    return this.projectInfoSources.map((it) => {
      const {
        projectId,
        keyboardName,
        projectPath,
        hexFilePath,
        presetNames,
        layoutNames,
      } = it;
      return {
        projectId,
        keyboardName,
        projectPath,
        presetNames,
        layoutNames,
        hasLayout: layoutNames.length > 0,
        hasFirmwareBinary: !!hexFilePath,
      };
    });
  }

  private getProjectInfoSourceById(
    projectId: string,
  ): IProjectResourceInfoSource | undefined {
    return this.projectInfoSources.find((info) => info.projectId === projectId);
  }

  internal_getProjectInfoSourceById = this.getProjectInfoSourceById;

  getPresetProfileFilePath(
    projectId: string,
    presetName: string,
  ): string | undefined {
    const info = this.getProjectInfoSourceById(projectId);
    if (info) {
      return pathJoin(info.projectFolderPath, 'profiles', `${presetName}.json`);
    }
  }

  getHexFilePath(projectId: string): string | undefined {
    const info = this.getProjectInfoSourceById(projectId);
    return info?.hexFilePath;
  }

  getLayoutFilePath(projectId: string, layoutName: string): string | undefined {
    const info = this.getProjectInfoSourceById(projectId);
    if (info) {
      return pathJoin(info.projectFolderPath, `${layoutName}.layout.json`);
    }
  }

  async initializeAsync(): Promise<void> {
    const resourceOrigin = appEnv.isDevelopment ? 'local' : 'central';
    // const resourceOrigin = 'central';
    this.projectInfoSources = await ProjectResourceInfoSourceLoader.loadProjectResourceInfoSources(
      resourceOrigin,
    );
  }
}
