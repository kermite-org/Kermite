import {
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
  fsxReaddir,
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
} from '~/shell/projectResources/interfaces';
import { GlobalSettingsProvider } from '~/shell/services/config/GlobalSettingsProvider';

export interface IPorjectFileJson {
  projectId: string;
  keyboardName: string;
  customParameterConfigurations: {
    targetVariationNames: string[];
    customParameters: ICustromParameterSpec[];
  }[];
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
  customParameterConfigurations: {
    targetVariationNames: string[];
    customParameters: ICustromParameterSpec[];
  }[];
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
          const _targetDevice = m?.[1] || '';
          const targetDevice = (['atmega32u4', 'rp2040'].includes(_targetDevice)
            ? _targetDevice
            : undefined) as IFirmwareTargetDevice;
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
          customParameterConfigurations,
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
          firmwares,
          origin: 'local' as const,
          customParameterConfigurations,
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
      const targetConfig = info.customParameterConfigurations.find(
        (it) =>
          it.targetVariationNames.includes(variationName) ||
          it.targetVariationNames.includes('all'),
      );
      if (targetConfig) {
        return { customParameterSpecs: targetConfig.customParameters };
      }
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
    variationName: string,
  ): Promise<IFirmwareBinaryFileSpec | undefined> {
    return this.getLocalFirmwareFileSpec(projectId, variationName);
  }
}
