import { shell } from 'electron';
import {
  createProjectKey,
  IProjectPackageFileContent,
  IProjectPackageInfo,
  IResourceOrigin,
  validateResourceName,
} from '~/shared';
import { appEnv } from '~/shell/base';
import {
  fsExistsSync,
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
  // configs.debugUseLocalRepositoryPackages = true;
}

function checkProjectFileContentSchema(
  data: IProjectPackageFileContent,
): boolean {
  return (
    data.formatRevision === 'PKG0' &&
    data.keyboardName !== undefined &&
    data.projectId !== undefined &&
    Array.isArray(data.firmwares) &&
    Array.isArray(data.layouts) &&
    Array.isArray(data.profiles)
  );
}

function convertPackageFileContentToPackageInfo(
  data: IProjectPackageFileContent,
  origin: IResourceOrigin,
  packageName: string,
  fixKeyboardName: boolean,
): IProjectPackageInfo {
  let { keyboardName } = data;
  if (fixKeyboardName && keyboardName.toLowerCase() !== packageName) {
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
  return (
    await Promise.all(
      packageNames.map(async (packageName) => {
        const filePath = pathJoin(folderPath, packageName + '.kmpkg.json');
        const data = (await fsxReadJsonFile(
          filePath,
        )) as IProjectPackageFileContent;
        if (!checkProjectFileContentSchema(data)) {
          return undefined;
        }
        migrateProjectPackageData(data);
        return convertPackageFileContentToPackageInfo(
          data,
          origin,
          packageName,
          true,
        );
      }),
    )
  ).filter((it) => it) as IProjectPackageInfo[];
}

async function loadDraftProjectPackageFile(
  filePath: string,
): Promise<IProjectPackageInfo | undefined> {
  if (fsExistsSync(filePath)) {
    const data = (await fsxReadJsonFile(
      filePath,
    )) as IProjectPackageFileContent;
    if (!checkProjectFileContentSchema(data)) {
      return undefined;
    }
    migrateProjectPackageData(data);
    const projectInfo = convertPackageFileContentToPackageInfo(
      data,
      'local',
      'draft_project',
      false,
    );
    projectInfo.isDraft = true;
    return projectInfo;
  }
  return undefined;
}

let cachedRemotePackages: IProjectPackageInfo[] | undefined;

async function loadRemoteProjectPackageInfos(): Promise<IProjectPackageInfo[]> {
  if (!cachedRemotePackages) {
    const remotePackagesLocalFolderPath = appEnv.resolveUserDataFilePath(
      'data/remote_projects',
    );
    cachedRemotePackages = await loadProjectPackageFiles(
      remotePackagesLocalFolderPath,
      'online',
    );
  }
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

function getUserDraftProjectFilePath() {
  return pathJoin(
    appEnv.userDataFolderPath,
    'data',
    `draft_project.kmpkg.json`,
  );
}

function getUserProjectFilePath(packageName: string, isDraft: boolean) {
  if (isDraft) {
    return getUserDraftProjectFilePath();
  } else {
    return pathJoin(
      appEnv.userDataFolderPath,
      'data',
      'projects',
      `${packageName}.kmpkg.json`,
    );
  }
}

async function loadUserProjectPackageInfos(): Promise<IProjectPackageInfo[]> {
  const projectsFolder = getUserProjectsFolderPath();
  const projectInfos = (
    await loadProjectPackageFiles(projectsFolder, 'local')
  ).filter(
    (it) => validateResourceName(it.packageName, 'package name') === undefined,
  );
  const draftFilePath = getUserDraftProjectFilePath();
  const draftProjectInfo = await loadDraftProjectPackageFile(draftFilePath);
  if (draftProjectInfo) {
    projectInfos.push(draftProjectInfo);
  }
  return projectInfos;
}

async function saveUserProjectPackageInfoImpl(info: IProjectPackageInfo) {
  const savingData = convertProjectPackageInfoToFileContent(info);
  const filePath = getUserProjectFilePath(info.packageName, !!info.isDraft);
  console.log(`saving ${pathBasename(filePath)}`);
  await fsxEnsureFolderExists(pathDirname(filePath));
  await fsxWriteJsonFile(filePath, savingData);
}

async function deleteUserProjectPackageFileImpl(
  packageName: string,
  isDraft: boolean,
) {
  const filePath = getUserProjectFilePath(packageName, isDraft);
  await fsxDeleteFile(filePath);
}

async function importLocalProjectPackageFromFileImpl(sourceFilePath: string) {
  const packageName = pathBasename(sourceFilePath, '.kmpkg.json');
  const data = (await fsxReadJsonFile(
    sourceFilePath,
  )) as IProjectPackageFileContent;
  if (!checkProjectFileContentSchema(data)) {
    throw new Error('invalid package file content');
  }
  migrateProjectPackageData(data);
  const destFilePath = getUserProjectFilePath(packageName, false);
  await fsxWriteJsonFile(destFilePath, data);
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
  async deleteLocalProjectPackageFile(packageName: string, isDraft: boolean) {
    await deleteUserProjectPackageFileImpl(packageName, isDraft);
  },
  async importLocalProjectPackageFromFile(filePath: string) {
    await importLocalProjectPackageFromFileImpl(filePath);
  },
  async openLocalProjectsFolder() {
    const folderPath = getUserProjectsFolderPath();
    await fsxEnsureFolderExists(folderPath);
    await shell.openPath(folderPath);
  },
};
