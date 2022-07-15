import {
  createProjectKey,
  encodeTextToBase64String,
  fileExtensions,
  IFileReadHandle,
  IFileWriteHandle,
  IProjectPackageFileContent,
  IProjectPackageInfo,
  IResourceOrigin,
  uniqueArrayItemsByField,
  validateResourceName,
} from '~/shared';
import { appConfig, appEnv } from '~/shell/base';
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
  const packageNames = fsxListFileBaseNames(folderPath, '.kmpkg');
  const items = packageNames
    .map((packageName) => {
      const filePath = pathJoin(folderPath, packageName + '.kmpkg');
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
  return pathJoin(appEnv.userDataFolderPath, 'data', `draft_project.kmpkg`);
}

function getUserProjectFilePath(packageName: string, isDraft: boolean) {
  if (isDraft) {
    return getUserDraftProjectFilePath();
  } else {
    return pathJoin(
      appEnv.userDataFolderPath,
      'data',
      'projects',
      `${packageName}.kmpkg`,
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
  sourceFileHandle: IFileReadHandle,
) {
  const packageName = pathBasename(
    sourceFileHandle.fileName,
    fileExtensions.package,
  );
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
  async importLocalProjectPackageFromFile(fileHandle: IFileReadHandle) {
    return await importLocalProjectPackageFromFileImpl(fileHandle);
  },
  async exportLocalProjectPackageToFile(
    fileHandle: IFileWriteHandle,
    info: IProjectPackageInfo,
  ) {
    const savingData = convertProjectPackageInfoToFileContent(info);
    await fsxWriteJsonToFileHandle(fileHandle, savingData);
  },
  submitLocalProjectPackageToServerSite(info: IProjectPackageInfo) {
    const savingData = convertProjectPackageInfoToFileContent(info);

    if (0) {
      const dataUrl = `data:text/plain;base64,${encodeTextToBase64String(
        JSON.stringify(savingData),
      )}`;
      window.open(
        `${appConfig.kermiteServerUrl}/request?packageData=${dataUrl}`,
        '_blank',
      );
    }

    if (1) {
      (async () => {
        const res = await fetch(`https://server.kermite.org/api/cache`, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify({ data: JSON.stringify(savingData) }),
          mode: 'cors',
        });
        if (res.status === 200) {
          const obj = await res.json();
          const { key } = obj;
          window.open(`https://server.kermite.org/request?key=${key}`);
        }
      })();
    }
  },
  openLocalProjectsFolder() {
    // const folderPath = getUserProjectsFolderPath();
    // await fsxEnsureFolderExists(folderPath);
    // await shell.openPath(folderPath);
    throw new Error('obsolete function invoked');
  },
};
