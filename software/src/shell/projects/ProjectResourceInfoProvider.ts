import { IProjectResourceInfo } from '~/shared';
import { appEnv } from '~/shell/base';
import { pathJoin } from '~/shell/funcs';
import { IProjectResourceInfoProvider } from '~/shell/projects/interfaces';
import {
  IProjectResourceInfoSource,
  ProjectResourceInfoSourceLoader,
} from './ProjectResource/ProjectResourceInfoSourceLoader';

class ProjectResourceInfoProvider implements IProjectResourceInfoProvider {
  private projectInfoSources: IProjectResourceInfoSource[] = [];

  getAllProjectResourceInfos(): IProjectResourceInfo[] {
    return this.projectInfoSources.map((it) => {
      const {
        projectId,
        keyboardName,
        projectPath,
        hexFilePath,
        presetNames,
        layoutNames,
        resourceOrigin,
      } = it;
      return {
        projectId,
        keyboardName,
        projectPath,
        presetNames,
        layoutNames,
        hasFirmwareBinary: !!hexFilePath,
        resourceOrigin,
      };
    });
  }

  private getProjectInfoSourceById(
    projectId: string,
  ): IProjectResourceInfoSource | undefined {
    return this.projectInfoSources.find((info) => info.projectId === projectId);
  }

  patchProjectInfoSource(
    projectId: string,
    callback: (info: IProjectResourceInfoSource) => void,
  ) {
    const info = this.projectInfoSources.find(
      (it) => it.projectId === projectId,
    );
    if (info) {
      callback(info);
    }
  }

  internal_getProjectInfoSourceById = this.getProjectInfoSourceById;

  getPresetProfileFilePath(
    projectId: string,
    presetName: string,
  ): string | undefined {
    const info = this.getProjectInfoSourceById(projectId);
    if (info) {
      return pathJoin(info.projectFolderPath, 'presets', `${presetName}.json`);
    }
  }

  getHexFilePath(projectId: string): string | undefined {
    const info = this.getProjectInfoSourceById(projectId);
    return info?.hexFilePath;
  }

  getLayoutFilePath(projectId: string, layoutName: string): string | undefined {
    const info = this.getProjectInfoSourceById(projectId);
    if (info) {
      const fileName =
        layoutName === 'default' ? 'layout.json' : `${layoutName}.layout.json`;
      return pathJoin(info.projectFolderPath, fileName);
    }
  }

  async initializeAsync(): Promise<void> {
    const resourceOrigin = appEnv.isDevelopment ? 'local' : 'online';
    // const resourceOrigin = 'central';
    this.projectInfoSources = await ProjectResourceInfoSourceLoader.loadProjectResourceInfoSources(
      resourceOrigin,
    );
  }
}
export const projectResourceInfoProvider = new ProjectResourceInfoProvider();
