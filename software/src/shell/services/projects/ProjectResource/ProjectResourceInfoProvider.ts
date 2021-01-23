import { IProjectResourceInfo } from '~/shared';
import { appEnv } from '~/shell/base';
import { pathJoin } from '~/shell/funcs';
import { IProjectResourceInfoProvider } from '../../serviceInterfaces';
import {
  IProjectResourceInfoSource,
  ProjectResourceInfoSourceLoader,
} from './ProjectResourceInfoSourceLoader';

export class ProjectResourceInfoProvider
  implements IProjectResourceInfoProvider {
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

  patchProjectInfoSource<K extends keyof IProjectResourceInfoSource>(
    projectId: string,
    key: K,
    value: IProjectResourceInfoSource[K],
  ) {
    const info = this.projectInfoSources.find(
      (it) => it.projectId === projectId,
    );
    if (info) {
      info[key] = value;
    }
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
      const fileName =
        layoutName === 'default' ? 'layout.json' : `${layoutName}.layout.json`;
      return pathJoin(info.projectFolderPath, fileName);
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
