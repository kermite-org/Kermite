import {
  ICustromParameterSpec,
  IPersistKeyboardDesign,
  IProfileData,
  IProjectCustomDefinition,
  IProjectResourceInfo,
  IResourceOrigin,
} from '~/shared';
import { createProjectSig } from '~/shared/funcs/DomainRelatedHelpers';
import { appEnv } from '~/shell/base';
import {
  fsExistsSync,
  fsxReaddir,
  fsxReadJsonFile,
  globAsync,
  pathBasename,
  pathDirname,
  pathJoin,
  pathRelative,
  pathResolve,
} from '~/shell/funcs';
import { LayoutFileLoader } from '~/shell/loaders/LayoutFileLoader';
import { ProfileFileLoader } from '~/shell/loaders/ProfileFileLoader';
import { IProjectResourceProviderImpl } from '~/shell/projectResources/interfaces';
import { GlobalSettingsProvider } from '~/shell/services/config/GlobalSettingsProvider';

export interface IPorjectFileJson {
  projectId: string;
  keyboardName: string;
  customParameters: ICustromParameterSpec[];
}
interface IProjectResourceInfoSource {
  origin: IResourceOrigin;
  projectId: string;
  keyboardName: string;
  projectPath: string;
  projectFolderPath: string;
  layoutNames: string[];
  presetNames: string[];
  hexFilePath?: string;
  customParameters: ICustromParameterSpec[];
}
namespace ProjectResourceInfoSourceLoader {
  function checkFileExistsOrBlank(filePath: string): string | undefined {
    return (fsExistsSync(filePath) && filePath) || undefined;
  }

  async function readPresetNames(presetsFolderPath: string): Promise<string[]> {
    if (fsExistsSync(presetsFolderPath)) {
      return (await fsxReaddir(presetsFolderPath))
        .filter((fpath) => fpath.endsWith('.profile.json'))
        .map((fpath) => pathBasename(fpath, '.profile.json'));
    } else {
      return [];
    }
  }

  async function readLayoutNames(projectFolderPath: string): Promise<string[]> {
    return (await fsxReaddir(projectFolderPath))
      .filter((fileName) => fileName.endsWith('.layout.json'))
      .map((fileName) => pathBasename(fileName, '.layout.json'));
  }

  async function readProjectFile(
    projectFilePath: string,
  ): Promise<IPorjectFileJson> {
    // TODO: スキーマをチェック
    return (await fsxReadJsonFile(projectFilePath)) as IPorjectFileJson;
  }

  export async function loadLocalResources(
    localRepositoryRootDir: string,
  ): Promise<IProjectResourceInfoSource[]> {
    const projectsRoot = pathJoin(
      localRepositoryRootDir,
      'firmware/src/projects',
    );

    if (!fsExistsSync(projectsRoot)) {
      console.log(`firmware projects folder ${projectsRoot} is not exist.`);
      console.log(
        `${localRepositoryRootDir} is not a valid Kermite project root folder.`,
      );
      return [];
    }

    const buildsRoot = pathJoin(localRepositoryRootDir, 'firmware/build');

    const projectFilePaths = await globAsync(
      `${projectsRoot}/**/*/project.json`,
    );

    return await Promise.all(
      projectFilePaths.map(async (projectFilePath) => {
        const projectPath = pathRelative(
          projectsRoot,
          pathDirname(projectFilePath),
        );
        const projectBaseDir = pathDirname(projectFilePath);

        const coreName = pathBasename(projectPath);
        const hexFilePath = checkFileExistsOrBlank(
          pathJoin(buildsRoot, projectPath, `${coreName}.hex`),
        );

        const {
          projectId,
          keyboardName,
          customParameters,
        } = await readProjectFile(projectFilePath);

        const presetsFolderPath = pathJoin(projectBaseDir, 'profiles');

        const presetNames = await readPresetNames(presetsFolderPath);

        const layoutNames = await readLayoutNames(projectBaseDir);

        return {
          projectId,
          keyboardName,
          projectPath,
          projectFolderPath: projectBaseDir,
          layoutNames,
          presetNames,
          hexFilePath,
          origin: 'local' as const,
          customParameters,
        };
      }),
    );
  }
}

export class ProjectResourceProviderImpl_Local
  implements IProjectResourceProviderImpl {
  private projectInfoSources: IProjectResourceInfoSource[] = [];

  private loadedLocalRepositoryDir: string | undefined;

  clearCache() {
    this.loadedLocalRepositoryDir = undefined;
  }

  private getLocalRepositoryDir() {
    const settings = GlobalSettingsProvider.getGlobalSettings();
    if (settings.useLocalResouces) {
      if (appEnv.isDevelopment) {
        return pathResolve('../');
      } else {
        return settings.localProjectRootFolderPath;
      }
    }
    return undefined;
  }

  async getAllProjectResourceInfos(): Promise<IProjectResourceInfo[]> {
    const localRepositoryDir = this.getLocalRepositoryDir();

    if (!localRepositoryDir) {
      return [];
    }
    if (localRepositoryDir !== this.loadedLocalRepositoryDir) {
      this.projectInfoSources = await ProjectResourceInfoSourceLoader.loadLocalResources(
        localRepositoryDir,
      );
      this.loadedLocalRepositoryDir = localRepositoryDir;
    }

    return this.projectInfoSources.map((it) => {
      const {
        origin,
        projectId,
        keyboardName,
        projectPath,
        hexFilePath,
        presetNames,
        layoutNames,
      } = it;
      return {
        sig: createProjectSig(origin, projectId),
        origin,
        projectId,
        keyboardName,
        projectPath,
        presetNames,
        layoutNames,
        hasFirmwareBinary: !!hexFilePath,
        firmwareBuildRevision: 0,
        firmwareBuildTimestamp: 'N/A',
      };
    });
  }

  private getProjectInfoSourceById(
    projectId: string,
  ): IProjectResourceInfoSource | undefined {
    return this.projectInfoSources.find((info) => info.projectId === projectId);
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async getProjectCustomDefinition(
    projectId: string,
  ): Promise<IProjectCustomDefinition | undefined> {
    const info = this.getProjectInfoSourceById(projectId);
    return info && { customParameterSpecs: info.customParameters };
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
      return pathJoin(
        info.projectFolderPath,
        'profiles',
        `${presetName}.profile.json`,
      );
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
      return pathJoin(info.projectFolderPath, `${layoutName}.layout.json`);
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
      return await LayoutFileLoader.loadLayoutFromFile(filePath);
    }
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async loadProjectFirmwareFile(
    projectId: string,
  ): Promise<string | undefined> {
    return this.getLocalHexFilePath(projectId);
  }
}
