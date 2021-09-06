import { shell } from 'electron';
import {
  createProjectKey,
  ICustomFirmwareInfo,
  IFirmwareTargetDevice,
  IProjectPackageFileContent,
  IProjectPackageInfo,
  IResourceOrigin,
} from '~/shared';
import { appEnv } from '~/shell/base';
import {
  cacheRemoteResource,
  fetchJson,
  fsxDeleteFile,
  fsxEnsureFolderExists,
  fsxListFileBaseNames,
  fsxReadJsonFile,
  fsxWriteJsonFile,
  pathBasename,
  pathDirname,
  pathJoin,
  pathResolve,
} from '~/shell/funcs';
import { migrateProjectPackageData } from '~/shell/loaders/ProjectPackageDataMigrator';

const configs = {
  debugUseLocalRepositoryPackages: false,
};
if (appEnv.isDevelopment) {
  configs.debugUseLocalRepositoryPackages = true;
}

function convertPackageFileContentToPackageInfo(
  data: IProjectPackageFileContent,
  origin: IResourceOrigin,
  packageName: string,
): IProjectPackageInfo {
  return {
    projectKey: createProjectKey(origin, data.projectId),
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
      migrateProjectPackageData(data);
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
      migrateProjectPackageData(data);
      const packageName = pathBasename(path, '.kmpkg.json');
      return convertPackageFileContentToPackageInfo(data, origin, packageName);
    }),
  );
}

async function loadRemoteProjectPackageInfos_debugLoadFromLocalRepository(): Promise<
  IProjectPackageInfo[]
> {
  const projectPackagesFolderPath = pathResolve('../firmware/project_packages');
  return await loadProjectPackageFiles(projectPackagesFolderPath, 'online');
}

function getUserProjectsFolderPath() {
  return pathJoin(appEnv.userDataFolderPath, 'data', 'projects');
}

function getUserProjectFilePath(packageName: string) {
  return pathJoin(
    appEnv.userDataFolderPath,
    'data',
    'projects',
    `${packageName}.kmpkg.json`,
  );
}

async function loadUserProjectPackageInfos(): Promise<IProjectPackageInfo[]> {
  const projectsFolder = getUserProjectsFolderPath();
  return await loadProjectPackageFiles(projectsFolder, 'local');
}

async function saveUserProjectPackageInfoImpl(info: IProjectPackageInfo) {
  const filePath = getUserProjectFilePath(info.packageName);
  console.log(`saving ${pathBasename(filePath)}`);
  await fsxEnsureFolderExists(pathDirname(filePath));
  await fsxWriteJsonFile(filePath, info);
}

async function deleteUserProjectPackageFileImpl(packageName: string) {
  const filePath = getUserProjectFilePath(packageName);
  await fsxDeleteFile(filePath);
}

function mapIndexFirmwareEntryToCustomFirmwareInfo(
  entry: IIndexFirmwaresContent['firmwares'][0],
): ICustomFirmwareInfo {
  return {
    firmwareId: entry.firmwareId,
    firmwareProjectPath: entry.firmwareProjectPath,
    variationName: entry.variationName,
    targetDevice: entry.targetDevice,
    buildRevision: entry.releaseBuildRevision,
    buildTimestamp: entry.buildTimestamp,
  };
}

export const projectPackageProvider = {
  async getAllProjectPackageInfos(): Promise<IProjectPackageInfo[]> {
    if (configs.debugUseLocalRepositoryPackages) {
      return [
        ...(await loadRemoteProjectPackageInfos_debugLoadFromLocalRepository()),
        ...(await loadUserProjectPackageInfos()),
      ];
    } else {
      return [
        ...(await loadRemoteProjectPackageInfos()),
        ...(await loadUserProjectPackageInfos()),
      ];
    }
  },
  async saveLocalProjectPackageInfo(info: IProjectPackageInfo): Promise<void> {
    await saveUserProjectPackageInfoImpl(info);
  },
  async deleteLocalProjectPackageFile(packageName: string) {
    await deleteUserProjectPackageFileImpl(packageName);
  },
  async getAllCustomFirmwareInfos(): Promise<ICustomFirmwareInfo[]> {
    const data = (await cacheRemoteResource(
      fetchJson,
      `${remoteBaseUrl}/index.firmwares.json`,
    )) as IIndexFirmwaresContent;
    return data.firmwares.map(mapIndexFirmwareEntryToCustomFirmwareInfo);
  },
  async openLocalProjectsFolder() {
    await shell.openPath(getUserProjectsFolderPath());
  },
};
