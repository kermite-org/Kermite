import {
  getMatched,
  ICustomFirmwareInfo,
  IFirmwareTargetDevice,
} from '~/shared';
import { appConfig } from '~/shell/base';
import {
  cacheRemoteResource,
  fetchJson,
  fsExistsSync,
  fsxReadFile,
  globAsync,
  pathBasename,
  pathDirname,
  pathJoin,
  pathRelative,
  pathResolve,
} from '~/shell/funcs';

namespace OnlineFirmwareListLoader {
  type IIndexFirmwaresContent = {
    firmwares: {
      firmwareId: string;
      firmwareProjectPath: string;
      variationName: string;
      targetDevice: IFirmwareTargetDevice;
      buildResult: 'success' | 'failure';
      firmwareFileName: string;
      metadataFileName: string;
      releaseBuildRevision: number;
      buildTimestamp: string;
    }[];
  };

  function mapIndexFirmwareEntryToCustomFirmwareInfo(
    entry: IIndexFirmwaresContent['firmwares'][0],
  ): ICustomFirmwareInfo {
    return {
      firmwareOrigin: 'online',
      firmwareId: entry.firmwareId,
      firmwareProjectPath: entry.firmwareProjectPath,
      variationName: entry.variationName,
      targetDevice: entry.targetDevice,
      binaryFileName: entry.firmwareFileName,
      buildRevision: entry.releaseBuildRevision,
      buildTimestamp: entry.buildTimestamp,
    };
  }

  export async function loadOnlineFirmwareInfos(): Promise<
    ICustomFirmwareInfo[]
  > {
    const { onlineResourcesBaseUrl } = appConfig;
    const data = (await cacheRemoteResource(
      fetchJson,
      `${onlineResourcesBaseUrl}/index.firmwares.json`,
    )) as IIndexFirmwaresContent;
    return data.firmwares.map(mapIndexFirmwareEntryToCustomFirmwareInfo);
  }
}

namespace LocalRepositoryFirmwareListLoader {
  type ICustomFirmwareInfo_WithBinaryFilePath = ICustomFirmwareInfo & {
    firmwareLocalBinaryFilePath: string;
  };

  async function loadLocalFirmwareInfo(
    elfFilePath: string,
    projectsRoot: string,
    buildsRoot: string,
  ): Promise<ICustomFirmwareInfo_WithBinaryFilePath | undefined> {
    const variationPath = pathRelative(buildsRoot, pathDirname(elfFilePath));

    try {
      const projectPath = pathDirname(variationPath);
      const variationName = pathBasename(variationPath);
      const firmwareSrcDir = pathJoin(projectsRoot, variationPath);

      const configFilePath = pathJoin(firmwareSrcDir, 'config.h');
      const ruleMkFilePath = pathJoin(firmwareSrcDir, 'rules.mk');

      if (!(fsExistsSync(configFilePath) && fsExistsSync(ruleMkFilePath))) {
        return undefined;
      }

      const configContent = await fsxReadFile(configFilePath);
      const firmwareId =
        getMatched(
          configContent,
          /^#define KERMITE_FIRMWARE_ID "([a-zA-Z0-9]+)"$/m,
        ) ?? '';
      const rulesMkContent = await fsxReadFile(ruleMkFilePath);
      const targetDevice =
        (getMatched(
          rulesMkContent,
          /^TARGET_MCU\s?=\s?(.+)$/m,
        ) as IFirmwareTargetDevice) ?? '';

      if (!(firmwareId && targetDevice)) {
        return undefined;
      }

      const hexFilePath = elfFilePath.replace(/\.elf$/, '.hex');
      const uf2FilePath = elfFilePath.replace(/\.elf$/, '.uf2');

      const targetBinaryFilePath =
        targetDevice === 'rp2040' ? uf2FilePath : hexFilePath;
      const valid = fsExistsSync(targetBinaryFilePath);
      if (valid) {
        const binaryFileName = pathBasename(targetBinaryFilePath);
        return {
          firmwareOrigin: 'localBuild',
          firmwareId,
          firmwareProjectPath: projectPath,
          variationName,
          targetDevice,
          binaryFileName,
          firmwareLocalBinaryFilePath: targetBinaryFilePath,
          buildRevision: 0,
          buildTimestamp: '',
        };
      }
    } catch (error) {
      console.log(error);
      return undefined;
    }
    return undefined;
  }

  export async function loadLocalFirmwareInfos(): Promise<
    ICustomFirmwareInfo_WithBinaryFilePath[]
  > {
    // todo: globalSettingsのlocal repository pathから読み込む
    const projectsRoot = pathResolve('../firmware/src/projects');
    const buildsRoot = pathResolve('../firmware/build');
    const elfFilePaths = await globAsync(`${buildsRoot}/**/*.elf`);
    const allFirmwareInfos = await Promise.all(
      elfFilePaths.map(
        async (elfFilePath) =>
          await loadLocalFirmwareInfo(elfFilePath, projectsRoot, buildsRoot),
      ),
    );
    const firmwareInfos = allFirmwareInfos.filter(
      (it) => !!it,
    ) as ICustomFirmwareInfo_WithBinaryFilePath[];
    return firmwareInfos;
  }
}

const state = new (class {
  onlineFirmwareInfos: ICustomFirmwareInfo[] | undefined;
  firmwareIdToLocalBinaryFilePathMap: Record<string, string> = {};
})();

export const customFirmwareInfoProvider = {
  async getAllCustomFirmwareInfos(): Promise<ICustomFirmwareInfo[]> {
    state.onlineFirmwareInfos ||=
      await OnlineFirmwareListLoader.loadOnlineFirmwareInfos();
    const localFirmwareInfos =
      await LocalRepositoryFirmwareListLoader.loadLocalFirmwareInfos();
    state.firmwareIdToLocalBinaryFilePathMap = Object.fromEntries(
      localFirmwareInfos.map((it) => [
        it.firmwareId,
        it.firmwareLocalBinaryFilePath,
      ]),
    );
    return [
      ...state.onlineFirmwareInfos,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ...localFirmwareInfos.map(({ firmwareLocalBinaryFilePath, ...rest }) => ({
        ...rest,
      })),
    ];
  },
  getLocalBuildFirmwareBinaryPath(firmwareId: string): string | undefined {
    return state.firmwareIdToLocalBinaryFilePathMap[firmwareId];
  },
};
