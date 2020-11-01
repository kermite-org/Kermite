import { IProjectResourceInfo } from '~defs/ProfileData';
import { pathJoin } from '~funcs/Files';
import { IProjectResourceInfoProvider } from '../serviceInterfaces';
import {
  IProjectResourceInfoSource,
  ProjectResourceInfoSourceLoader
} from './ProjectResourceInfoSourceLoader';

export class ProjectResourceInfoProvider
  implements IProjectResourceInfoProvider {
  projectResourceInfoSources: IProjectResourceInfoSource[] = [];

  getAllProjectResourceInfos(): IProjectResourceInfo[] {
    return this.projectResourceInfoSources.map((it) => {
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

  private getProjectResourceInfoById(projectId: string) {
    return this.projectResourceInfoSources.find(
      (info) => info.projectId === projectId
    );
  }

  getPresetProfileFilePath(
    projectId: string,
    presetName: string
  ): string | undefined {
    const info = this.getProjectResourceInfoById(projectId);
    const folder = info?.presetsFolderPath;
    return folder && pathJoin(folder, `${presetName}.json`);
  }

  getHexFilePath(projectId: string): string | undefined {
    const info = this.getProjectResourceInfoById(projectId);
    return info?.hexFilePath;
  }

  getLayoutFilePath(projectId: string): string | undefined {
    const info = this.getProjectResourceInfoById(projectId);
    return info?.layoutFilePath;
  }

  async initialize(): Promise<void> {
    this.projectResourceInfoSources = await ProjectResourceInfoSourceLoader.loadProjectResourceInfoSources();
  }
}
