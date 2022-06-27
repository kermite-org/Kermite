import {
  createProjectKey,
  fileExtensions,
  getFileNameFromHandle,
  IProjectPackageFileContent,
  IProjectPackageInfo,
  IResourceOrigin,
  uniqueArrayItemsByField,
  validateResourceName,
} from '~/shared';
import { appEnv } from '~/shell/base';
import {
  fsExistsSync,
  fsxDeleteFile,
  fsxEnsureFolderExists,
  fsxListFileBaseNames,
  fsxReadJsonFile,
  fsxReadJsonFromFileHandle,
  fsxWriteJsonFile,
  fsxWriteJsonToFileHandle,
  pathBasename,
  pathDirname,
  pathJoin,
  pathResolve,
} from '~/shell/funcs';
import { migrateProjectPackageData } from '~/shell/loaders/projectPackageDataMigrator';
import { loadKermiteServerProjectPackageInfos } from '~/shell/modules/project/kermiteServerProjectLoader';

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

function loadProjectPackageFiles(
  folderPath: string,
  origin: IResourceOrigin,
): IProjectPackageInfo[] {
  const packageNames = fsxListFileBaseNames(folderPath, '.kmpkg.json');
  const items = packageNames
    .map((packageName) => {
      const filePath = pathJoin(folderPath, packageName + '.kmpkg.json');
      const data = fsxReadJsonFile(filePath) as IProjectPackageFileContent;
      migrateProjectPackageData(data);
      if (!checkProjectFileContentSchema(data)) {
        console.log(`drop package ${origin} ${packageName}`);
        return undefined;
      }
      return convertPackageFileContentToPackageInfo(
        data,
        origin,
        packageName,
        true,
      );
    })
    .filter((it) => it) as IProjectPackageInfo[];
  return uniqueArrayItemsByField(items, 'projectId');
}

function loadDraftProjectPackageFile(
  filePath: string,
): IProjectPackageInfo | undefined {
  if (fsExistsSync(filePath)) {
    const data = fsxReadJsonFile(filePath) as IProjectPackageFileContent;
    migrateProjectPackageData(data);
    if (!checkProjectFileContentSchema(data)) {
      return undefined;
    }
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

function loadRemoteProjectPackageInfos_debugLoadFromLocalRepository(): IProjectPackageInfo[] {
  const projectPackagesFolderPath = pathResolve('../firmware/project_packages');
  return loadProjectPackageFiles(projectPackagesFolderPath, 'online');
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

function loadUserProjectPackageInfos(): IProjectPackageInfo[] {
  const projectsFolder = getUserProjectsFolderPath();
  const projectInfos = loadProjectPackageFiles(projectsFolder, 'local').filter(
    (it) => validateResourceName(it.packageName, 'package name') === undefined,
  );
  const draftFilePath = getUserDraftProjectFilePath();
  const draftProjectInfo = loadDraftProjectPackageFile(draftFilePath);
  if (draftProjectInfo) {
    projectInfos.push(draftProjectInfo);
  }
  return projectInfos;
}

function saveUserProjectPackageInfoImpl(info: IProjectPackageInfo) {
  const savingData = convertProjectPackageInfoToFileContent(info);
  const filePath = getUserProjectFilePath(info.packageName, !!info.isDraft);
  console.log(`saving ${pathBasename(filePath)}`);
  fsxEnsureFolderExists(pathDirname(filePath));
  fsxWriteJsonFile(filePath, savingData);
}

function deleteUserProjectPackageFileImpl(
  packageName: string,
  isDraft: boolean,
) {
  const filePath = getUserProjectFilePath(packageName, isDraft);
  fsxDeleteFile(filePath);
}

async function importLocalProjectPackageFromFileImpl(
  sourceFileHandle: FileSystemFileHandle,
) {
  const fileName = await getFileNameFromHandle(sourceFileHandle);
  const packageName = pathBasename(fileName, fileExtensions.package);
  const data = (await fsxReadJsonFromFileHandle(
    sourceFileHandle,
  )) as IProjectPackageFileContent;
  migrateProjectPackageData(data);
  if (!checkProjectFileContentSchema(data)) {
    throw new Error('invalid package file content');
  }
  const destFilePath = getUserProjectFilePath(packageName, false);
  fsxEnsureFolderExists(pathDirname(destFilePath));
  fsxWriteJsonFile(destFilePath, data);
}

export const projectPackageProvider = {
  getAllProjectPackageInfos(): IProjectPackageInfo[] {
    if (configs.debugUseLocalRepositoryPackages) {
      return [
        ...loadRemoteProjectPackageInfos_debugLoadFromLocalRepository(),
        ...loadUserProjectPackageInfos(),
      ];
    } else {
      return [
        ...loadKermiteServerProjectPackageInfos(),
        ...loadUserProjectPackageInfos(),
      ];
    }
  },
  saveLocalProjectPackageInfo(info: IProjectPackageInfo) {
    saveUserProjectPackageInfoImpl(info);
  },
  deleteLocalProjectPackageFile(packageName: string, isDraft: boolean) {
    deleteUserProjectPackageFileImpl(packageName, isDraft);
  },
  async importLocalProjectPackageFromFile(fileHandle: FileSystemFileHandle) {
    return await importLocalProjectPackageFromFileImpl(fileHandle);
  },
  async exportLocalProjectPackageToFile(
    fileHandle: FileSystemFileHandle,
    info: IProjectPackageInfo,
  ) {
    const savingData = convertProjectPackageInfoToFileContent(info);
    await fsxWriteJsonToFileHandle(fileHandle, savingData);
  },
  openLocalProjectsFolder() {
    // const folderPath = getUserProjectsFolderPath();
    // await fsxEnsureFolderExists(folderPath);
    // await shell.openPath(folderPath);
    throw new Error('obsolete function invoked');
  },
};
