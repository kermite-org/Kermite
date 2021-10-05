import { shell } from 'electron';
import {
  createProjectKey,
  IProjectPackageFileContent,
  IProjectPackageInfo,
  IResourceOrigin,
  validateResourceName,
} from '~/shared';
import { appConfig, appEnv } from '~/shell/base';
import {
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
  let { keyboardName } = data;
  if (keyboardName.toLowerCase() !== packageName) {
    keyboardName = packageName;
  }
  return {
    ...data,
    projectKey: createProjectKey(origin, data.projectId),
    origin,
    packageName,
    keyboardName,
  };
}

function convertProjectPackageInfoToFileContent(
  info: IProjectPackageInfo,
): IProjectPackageFileContent {
  return {
    formatRevision: info.formatRevision,
    projectId: info.projectId,
    keyboardName: info.keyboardName,
    firmwares: info.firmwares,
    layouts: info.layouts,
    profiles: info.profiles,
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

let cachedRemotePackages: IProjectPackageInfo[] | undefined;

async function loadRemoteProjectPackageInfos(): Promise<IProjectPackageInfo[]> {
  if (cachedRemotePackages) {
    return cachedRemotePackages;
  }
  const { onlineResourcesBaseUrl } = appConfig;

  const indexContent = (await fetchJson(
    `${onlineResourcesBaseUrl}/index.json`,
  )) as IIndexContent;
  const origin = 'online' as const;

  const targetPaths = Object.keys(indexContent.files).filter((it) =>
    it.endsWith('.kmpkg.json'),
  );
  cachedRemotePackages = await Promise.all(
    targetPaths.map(async (path) => {
      const data = (await fetchJson(
        `${onlineResourcesBaseUrl}/${path}`,
      )) as IProjectPackageFileContent;
      migrateProjectPackageData(data);
      const packageName = pathBasename(path, '.kmpkg.json');
      return convertPackageFileContentToPackageInfo(data, origin, packageName);
    }),
  );
  return cachedRemotePackages;
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
  return (await loadProjectPackageFiles(projectsFolder, 'local')).filter(
    (it) => validateResourceName(it.packageName, 'package name') === undefined,
  );
}

async function saveUserProjectPackageInfoImpl(info: IProjectPackageInfo) {
  const savingData = convertProjectPackageInfoToFileContent(info);
  const filePath = getUserProjectFilePath(info.packageName);
  console.log(`saving ${pathBasename(filePath)}`);
  await fsxEnsureFolderExists(pathDirname(filePath));
  await fsxWriteJsonFile(filePath, savingData);
}

async function deleteUserProjectPackageFileImpl(packageName: string) {
  const filePath = getUserProjectFilePath(packageName);
  await fsxDeleteFile(filePath);
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
  async openLocalProjectsFolder() {
    const folderPath = getUserProjectsFolderPath();
    await fsxEnsureFolderExists(folderPath);
    await shell.openPath(folderPath);
  },
};
