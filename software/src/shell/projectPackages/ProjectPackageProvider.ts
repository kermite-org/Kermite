import {
  ICustomFirmwareInfo,
  IFirmwareTargetDevice,
  IProjectPackageFileContent,
  IProjectPackageInfo,
  IResourceOrigin,
} from '~/shared';
import { appEnv } from '~/shell/base';
import {
  cacheRemoteResouce,
  fetchJson,
  fsxListFileBaseNames,
  fsxReadJsonFile,
  fsxWriteJsonFile,
  pathBasename,
  pathJoin,
} from '~/shell/funcs';

interface IProjectPackageProvider {
  getAllProjectPackageInfos(): Promise<IProjectPackageInfo[]>;
  saveLocalProjectPackageInfo(info: IProjectPackageInfo): Promise<void>;
  getAllCustomFirmwareInfos(): Promise<ICustomFirmwareInfo[]>;
}

function convertPackageFileContentToPackageInfo(
  data: IProjectPackageFileContent,
  origin: IResourceOrigin,
  packageName: string,
): IProjectPackageInfo {
  return {
    sig: `${origin}#${data.projectId}`,
    origin,
    packageName,
    ...data,
  };
}

async function loadProjectPackageFiles(
  folderPath: string,
  origin: IResourceOrigin,
): Promise<IProjectPackageInfo[]> {
  const packageNames = await fsxListFileBaseNames(folderPath, '.kmpkg.json');
  return await Promise.all(
    packageNames.map(async (packageName) => {
      const filePath = pathJoin(folderPath, packageName + '.kmpkg.json');
      const data = (await fsxReadJsonFile(
        filePath,
      )) as IProjectPackageFileContent;
      return convertPackageFileContentToPackageInfo(data, origin, packageName);
    }),
  );
}

type IIndexContent = {
  files: Record<string, string>;
};

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

const remoteBaseUrl = 'https://app.kermite.org/krs/resources2';

async function loadRemoteProjectPackageInfos(): Promise<IProjectPackageInfo[]> {
  const indexContent = (await fetchJson(
    `${remoteBaseUrl}/index.json`,
  )) as IIndexContent;
  const origin = 'online' as const;

  const targetPaths = Object.keys(indexContent.files).filter((it) =>
    it.endsWith('.kmpkg.json'),
  );
  return await Promise.all(
    targetPaths.map(async (path) => {
      const data = (await fetchJson(
        `${remoteBaseUrl}/${path}`,
      )) as IProjectPackageFileContent;
      const packageName = pathBasename(path, '.kmpkg.json');
      return convertPackageFileContentToPackageInfo(data, origin, packageName);
    }),
  );
}

async function loadLocalProjectPackageInfos(): Promise<IProjectPackageInfo[]> {
  const projectsFolder = pathJoin(
    appEnv.userDataFolderPath,
    'data',
    'projects',
  );
  return await loadProjectPackageFiles(projectsFolder, 'local');
}

async function saveLocalProjectPackgeInfoImpl(info: IProjectPackageInfo) {
  const filePath = pathJoin(
    appEnv.userDataFolderPath,
    'data',
    'projects',
    `${info.packageName}.kmpkg.json`,
  );
  console.log(`saving ${pathBasename(filePath)}`);
  await fsxWriteJsonFile(filePath, info);
}
export class ProjectPackageProvider implements IProjectPackageProvider {
  async getAllProjectPackageInfos(): Promise<IProjectPackageInfo[]> {
    return [
      ...(await loadRemoteProjectPackageInfos()),
      ...(await loadLocalProjectPackageInfos()),
    ];
  }

  async saveLocalProjectPackageInfo(info: IProjectPackageInfo): Promise<void> {
    await saveLocalProjectPackgeInfoImpl(info);
  }

  async getAllCustomFirmwareInfos(): Promise<ICustomFirmwareInfo[]> {
    const data = (await cacheRemoteResouce(
      fetchJson,
      `${remoteBaseUrl}/index.firmwares.json`,
    )) as IIndexFirmwaresContent;
    return data.firmwares.map((info) => {
      return {
        firmwareId: info.firmwareId,
        firmwareProjectPath: info.firmwareProjectPath,
        variationName: info.variationName,
        targetDevice: info.targetDevice,
        buildRevision: info.releaseBuildRevision,
        buildTimestamp: info.buildTimestamp,
      };
    });
  }
}
