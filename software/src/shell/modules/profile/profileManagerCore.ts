import {
  IPersistProfileFileData,
  IProfileData,
  IProfileEntry,
  validateResourceName,
} from '~/shared';
import { appEnv } from '~/shell/base';
import {
  fspCopyFile,
  fspReaddir,
  fspRename,
  fspUnlink,
  fsRmdirSync,
  fsxEnsureFolderExists,
  fsxReaddir,
  fsxReadJsonFile,
  fsxRenameFile,
  listAllFilesNameEndWith,
  pathBasename,
  pathDirname,
  pathJoin,
} from '~/shell/funcs';
import { ProfileFileLoader } from '~/shell/loaders/profileFileLoader';

function getProjectProfileFolderName(projectId: string) {
  // const { allProjectPackageInfos } = coreState;
  // const project = allProjectPackageInfos.find(
  //   (it) => it.projectId === projectId,
  // );
  // if (project) {
  //   return `${projectId}_${project.packageName}`;
  // } else {
  //   return projectId;
  // }
  return projectId;
}

function getProfileFilePath(profileEntry: IProfileEntry): string {
  const { projectId, profileName } = profileEntry;
  const folderName = getProjectProfileFolderName(projectId);
  return appEnv.resolveUserDataFilePath(
    `data/profiles/${folderName}/${profileName.toLowerCase()}.profile.json`,
  );
}

function getProfileEntry(
  relativeFilePath: string,
  profilesBaseDir: string,
): IProfileEntry {
  const projectId = pathDirname(relativeFilePath).slice(0, 6);
  const filePath = pathJoin(profilesBaseDir, relativeFilePath);
  const userProfileData = fsxReadJsonFile(filePath) as IPersistProfileFileData;
  const profileNameFromContent = userProfileData.profileName || '';
  const profileNameFromFileName = pathBasename(
    relativeFilePath,
    '.profile.json',
  );
  const isContentProfileNameValid =
    profileNameFromContent.toLowerCase() === profileNameFromFileName;
  const profileName = isContentProfileNameValid
    ? profileNameFromContent
    : profileNameFromFileName;
  return {
    projectId,
    profileName,
  };
}

export const profileManagerCore = {
  getProfilesFolderPath(profileEntry: IProfileEntry): string {
    const { projectId } = profileEntry;
    const folderName = getProjectProfileFolderName(projectId);
    const folderPath = `data/profiles/${folderName}`;
    return appEnv.resolveUserDataFilePath(folderPath);
  },
  ensureProfilesDirectoryExists() {
    const dataDirPath = appEnv.resolveUserDataFilePath('data');
    fsxEnsureFolderExists(dataDirPath);
    const profilesBaseDir = appEnv.resolveUserDataFilePath('data/profiles');
    fsxEnsureFolderExists(profilesBaseDir);
  },
  migrateOldProfileFolderNames() {
    const profilesBaseDir = appEnv.resolveUserDataFilePath(`data/profiles`);
    const folderNames = fsxReaddir(profilesBaseDir);
    for (const folderName of folderNames) {
      const modFolderName = getProjectProfileFolderName(folderName);
      if (modFolderName !== folderName) {
        const srcPath = pathJoin(profilesBaseDir, folderName);
        const dstPath = pathJoin(profilesBaseDir, modFolderName);
        console.log(`rename folder ${folderName} ${modFolderName}`);
        fsxRenameFile(srcPath, dstPath);
      }
    }
  },
  listAllProfileEntries(): IProfileEntry[] {
    const profilesBaseDir = appEnv.resolveUserDataFilePath(`data/profiles`);
    const relativeFilePaths = listAllFilesNameEndWith(
      'profile.json',
      profilesBaseDir,
    );
    const allProfileEntries = relativeFilePaths.map((relPath) =>
      getProfileEntry(relPath, profilesBaseDir),
    );
    return allProfileEntries.filter(
      (it) =>
        validateResourceName(it.profileName, 'profile name') === undefined,
    );
  },
  loadProfile(profileEntry: IProfileEntry): IProfileData {
    const filePath = getProfileFilePath(profileEntry);
    const profileData = ProfileFileLoader.loadProfileFromFile(filePath);
    profileData.projectId = profileEntry.projectId;
    return profileData;
  },
  ensureSavingFolder(filePath: string) {
    fsxEnsureFolderExists(pathDirname(filePath));
  },
  saveProfile(profileEntry: IProfileEntry, profileData: IProfileData): void {
    const filePath = getProfileFilePath(profileEntry);
    console.log(`saving current profile to ${pathBasename(filePath)}`);
    this.ensureSavingFolder(filePath);
    ProfileFileLoader.saveProfileToFile(
      filePath,
      profileData,
      profileEntry.profileName,
    );
  },
  loadExternalProfileFile(filePath: string): IProfileData {
    return ProfileFileLoader.loadProfileFromFile(filePath);
  },
  saveExternalProfileFile(filePath: string, profileData: IProfileData): void {
    const profileName = pathBasename(filePath, '.profile.json');
    const baseDir = pathDirname(filePath);
    const savingFilePath = pathJoin(baseDir, profileName.toLowerCase());
    ProfileFileLoader.saveProfileToFile(
      savingFilePath,
      profileData,
      profileName,
    );
  },
  deleteProfile(profileEntry: IProfileEntry): void {
    const filePath = getProfileFilePath(profileEntry);
    fspUnlink(filePath);
    const folderPath = pathDirname(filePath);
    const fileNames = fspReaddir(folderPath);
    if (fileNames.length === 0) {
      fsRmdirSync(folderPath);
    }
  },
  renameProfile(
    profileEntry: IProfileEntry,
    newProfileEntry: IProfileEntry,
  ): void {
    const srcPath = getProfileFilePath(profileEntry);
    const dstPath = getProfileFilePath(newProfileEntry);
    fspRename(srcPath, dstPath);
  },
  copyProfile(
    profileEntry: IProfileEntry,
    newProfileEntry: IProfileEntry,
  ): void {
    const srcPath = getProfileFilePath(profileEntry);
    const dstPath = getProfileFilePath(newProfileEntry);
    fspCopyFile(srcPath, dstPath);
  },
};
