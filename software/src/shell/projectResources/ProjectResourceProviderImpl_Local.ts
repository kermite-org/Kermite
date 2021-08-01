import {
  getSystemParameterDefinitionBySystemParameterKey,
  ICustromParameterSpec,
  IFirmwareTargetDevice,
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
  fsLstatSync,
  fsxListFileBaseNames,
  fsxReadFile,
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
import {
  IFirmwareBinaryFileSpec,
  IProjectResourceProviderImpl,
} from '~/shell/projectResources/Interfaces';
import { globalSettingsProvider } from '~/shell/services/config/GlobalSettingsProvider';

interface IParameterConfigurationEntry {
  targetVariationNames?: string[];
  systemParameterKeys: string[];
}
export interface IPorjectFileJson {
  projectId: string;
  keyboardName: string;
  parameterConfigurations:
    | IParameterConfigurationEntry
    | IParameterConfigurationEntry[];
}

interface IProjectResourceInfoSource {
  origin: IResourceOrigin;
  projectId: string;
  keyboardName: string;
  projectPath: string;
  projectFolderPath: string;
  layoutNames: string[];
  presetNames: string[];
  firmwares: {
    variationName: string;
    targetDevice: IFirmwareTargetDevice;
    binaryFilePath: string;
    buildRevision: number;
    buildTimestamp: string;
  }[];
  parameterConfigurations: IParameterConfigurationEntry[];
}
namespace ProjectResourceInfoSourceLoader {
  function checkFileExistsOrBlank(filePath: string): string | undefined {
    return (fsExistsSync(filePath) && filePath) || undefined;
  }

  async function readProjectDataFileNames(
    projectBaseDir: string,
    extension: string,
  ): Promise<string[]> {
    const projectDataDir = pathJoin(projectBaseDir, '__data');
    return [
      ...(await fsxListFileBaseNames(projectBaseDir, extension)),
      ...(await fsxListFileBaseNames(projectDataDir, extension)),
    ];
  }

  async function readProjectFile(
    projectFilePath: string,
  ): Promise<IPorjectFileJson> {
    // TODO: スキーマをチェック
    return (await fsxReadJsonFile(projectFilePath)) as IPorjectFileJson;
  }

  async function gatherFirmwares(
    localRepositoryRootDir: string,
    projectPath: string,
  ): Promise<IProjectResourceInfoSource['firmwares']> {
    const projectsRoot = pathJoin(
      localRepositoryRootDir,
      'firmware/src/projects',
    );
    const buildsRoot = pathJoin(localRepositoryRootDir, 'firmware/build');
    const projectBaseDir = pathJoin(projectsRoot, projectPath);
    const rulesMks = await globAsync('**/rules.mk', projectBaseDir);
    const coreName = pathBasename(projectPath);

    return (
      await Promise.all(
        rulesMks.map(async (rulesMk) => {
          const variationName = pathDirname(rulesMk);
          const content = await fsxReadFile(pathJoin(projectBaseDir, rulesMk));
          const m = content.match(/^TARGET_MCU\s?=\s?(.+)$/m);
          const targetDevice = (m?.[1] || '') as IFirmwareTargetDevice;
          const extension = targetDevice === 'atmega32u4' ? 'hex' : 'uf2';
          const _binaryFilePath = pathJoin(
            buildsRoot,
            projectPath,
            variationName,
            `${coreName}_${variationName}.${extension}`,
          );
          const binaryFilePath = checkFileExistsOrBlank(_binaryFilePath) || '';
          const buildTimestamp =
            (binaryFilePath &&
              (() => {
                const mtime = fsLstatSync(binaryFilePath).mtime;
                return mtime.toISOString();
              })()) ||
            '';
          return {
            variationName,
            targetDevice,
            binaryFilePath,
            buildRevision: 0,
            buildTimestamp,
          };
        }),
      )
    ).filter((it) => it.targetDevice && it.binaryFilePath);
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

        const firmwares = await gatherFirmwares(
          localRepositoryRootDir,
          projectPath,
        );

        const {
          projectId,
          keyboardName,
          parameterConfigurations: _parameterConfigurations,
        } = await readProjectFile(projectFilePath);

        const parameterConfigurations = Array.isArray(_parameterConfigurations)
          ? _parameterConfigurations
          : [_parameterConfigurations];

        const presetNames = await readProjectDataFileNames(
          projectBaseDir,
          '.profile.json',
        );
        const layoutNames = await readProjectDataFileNames(
          projectBaseDir,
          '.layout.json',
        );

        return {
          projectId,
          keyboardName,
          projectPath,
          projectFolderPath: projectBaseDir,
          layoutNames,
          presetNames,
          firmwares,
          origin: 'local' as const,
          parameterConfigurations,
        };
      }),
    );
  }
}

export function readCustomParameterDefinition(
  parameterConfigurations: IParameterConfigurationEntry[],
  variationName: string,
): IProjectCustomDefinition | undefined {
  const targetConfig = parameterConfigurations.find(
    (it) =>
      !it.targetVariationNames ||
      it.targetVariationNames.includes(variationName) ||
      it.targetVariationNames.includes('all'),
  );
  if (targetConfig) {
    const customParameterSpecs = targetConfig.systemParameterKeys
      .map(getSystemParameterDefinitionBySystemParameterKey)
      .filter((a) => !!a) as ICustromParameterSpec[];
    return { customParameterSpecs };
  }
  return undefined;
}

export class ProjectResourceProviderImpl_Local
  implements IProjectResourceProviderImpl {
  private projectInfoSources: IProjectResourceInfoSource[] = [];

  private loadedLocalRepositoryDir: string | undefined;

  clearCache() {
    this.loadedLocalRepositoryDir = undefined;
  }

  private getLocalRepositoryDir() {
    const settings = globalSettingsProvider.getGlobalSettings();
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
        firmwares,
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
        firmwares,
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
    variationName: string,
  ): Promise<IProjectCustomDefinition | undefined> {
    const info = this.getProjectInfoSourceById(projectId);
    if (info) {
      return readCustomParameterDefinition(
        info.parameterConfigurations,
        variationName,
      );
    }
    return undefined;
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

  private getLocalDataFilePath(
    projectId: string,
    namePart: string,
    extension: string,
  ): string | undefined {
    const info = this.getProjectInfoSourceById(projectId);
    if (info) {
      const filePath = pathJoin(
        info.projectFolderPath,
        `${namePart}${extension}`,
      );
      const filePathAlt = pathJoin(
        info.projectFolderPath,
        '__data',
        `${namePart}${extension}`,
      );
      if (fsExistsSync(filePathAlt)) {
        return filePathAlt;
      }
      return filePath;
    }
  }

  getLocalPresetProfileFilePath(projectId: string, namePart: string) {
    return this.getLocalDataFilePath(projectId, namePart, '.profile.json');
  }

  getLocalLayoutFilePath(projectId: string, namePart: string) {
    return this.getLocalDataFilePath(projectId, namePart, '.layout.json');
  }

  private getLocalFirmwareFileSpec(
    projectId: string,
    variationName: string,
  ): IFirmwareBinaryFileSpec | undefined {
    const info = this.getProjectInfoSourceById(projectId);
    if (info) {
      const firmware = info.firmwares.find(
        (it) => it.variationName === variationName,
      );
      if (firmware) {
        return {
          targetDevice: firmware.targetDevice,
          filePath: firmware.binaryFilePath,
        };
      }
    }
    return undefined;
  }

  async loadProjectPreset(
    projectId: string,
    presetName: string,
  ): Promise<IProfileData | undefined> {
    const filePath = this.getLocalDataFilePath(
      projectId,
      presetName,
      '.profile.json',
    );
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
    const filePath = this.getLocalDataFilePath(
      projectId,
      layoutName,
      '.layout.json',
    );
    if (filePath) {
      return await LayoutFileLoader.loadLayoutFromFile(filePath);
    }
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async loadProjectFirmwareFile(
    projectId: string,
    variationName: string,
  ): Promise<IFirmwareBinaryFileSpec | undefined> {
    return this.getLocalFirmwareFileSpec(projectId, variationName);
  }
}
