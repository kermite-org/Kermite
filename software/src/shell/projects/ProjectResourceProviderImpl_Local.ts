import {
  IPersistKeyboardDesign,
  IProfileData,
  IProjectResourceInfo,
} from '~/shared';
import { pathJoin } from '~/shell/funcs';
import { layoutFileLoader } from '~/shell/loaders/LayoutFileLoader';
import { ProfileFileLoader } from '~/shell/loaders/ProfileFileLoader';
import { IProjectResourceProviderImpl } from '~/shell/projects/interfaces';
import {
  IProjectResourceInfoSource,
  ProjectResourceInfoSourceLoader,
} from './ProjectResource/ProjectResourceInfoSourceLoader';

export class ProjectResourceProviderImpl_Local
  implements IProjectResourceProviderImpl {
  private projectInfoSources: IProjectResourceInfoSource[] = [];

  async loadAllProjectResourceInfos(): Promise<IProjectResourceInfo[]> {
    // const resourceOrigin = appEnv.isDevelopment ? 'local' : 'online';
    // const resourceOrigin = 'central';
    this.projectInfoSources = await ProjectResourceInfoSourceLoader.loadProjectResourceInfoSources(
      'local',
    );
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

  // patchLocalProjectInfoSource(
  //   projectId: string,
  //   callback: (info: IProjectResourceInfoSource) => void,
  // ) {
  //   const info = this.projectInfoSources.find(
  //     (it) => it.projectId === projectId,
  //   );
  //   if (info) {
  //     callback(info);
  //   }
  // }
  // internal_getProjectInfoSourceById = this.getProjectInfoSourceById;
  getLocalPresetProfileFilePath(
    projectId: string,
    presetName: string,
  ): string | undefined {
    const info = this.getProjectInfoSourceById(projectId);
    if (info) {
      return pathJoin(info.projectFolderPath, 'presets', `${presetName}.json`);
    }
  }

  private getLocalHexFilePath(projectId: string): string | undefined {
    const info = this.getProjectInfoSourceById(projectId);
    return info?.hexFilePath;
  }

  getLocalLayoutFilePath(
    projectId: string,
    layoutName: string,
  ): string | undefined {
    const info = this.getProjectInfoSourceById(projectId);
    if (info) {
      const fileName =
        layoutName === 'default' ? 'layout.json' : `${layoutName}.layout.json`;
      return pathJoin(info.projectFolderPath, fileName);
    }
  }

  async loadProjectPreset(
    projectId: string,
    presetName: string,
  ): Promise<IProfileData | undefined> {
    const filePath = this.getLocalPresetProfileFilePath(projectId, presetName);
    if (filePath) {
      try {
        return await ProfileFileLoader.loadProfileFromFile(filePath);
      } catch (error) {
        console.log(`errorr on loading preset file`);
        console.error(error);
      }
    }
    return undefined;
  }

  async loadProjectLayout(
    projectId: string,
    layoutName: string,
  ): Promise<IPersistKeyboardDesign | undefined> {
    const filePath = this.getLocalLayoutFilePath(projectId, layoutName);
    if (filePath) {
      return await layoutFileLoader.loadLayoutFromFile(filePath);
    }
  }

  async loadProjectFirmwareFile(
    projectId: string,
  ): Promise<string | undefined> {
    return this.getLocalHexFilePath(projectId);
  }
}
