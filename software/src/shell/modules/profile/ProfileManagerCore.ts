import {
  validateResourceName,
  IProfileData,
  IProfileEntry,
  IPersistProfileFileData,
} from '~/shared';
import { appEnv } from '~/shell/base/AppEnv';
import {
  fspCopyFile,
  fspReaddir,
  fspRename,
  fspUnlink,
  fsRmdirSync,
  fsxEnsureFolderExists,
  fsxReadJsonFile,
  globAsync,
  pathBasename,
  pathDirname,
  pathJoin,
} from '~/shell/funcs';
import { ProfileFileLoader } from '~/shell/loaders/ProfileFileLoader';

function getProfileFilePath(profileEntry: IProfileEntry): string {
  const { projectId, profileName } = profileEntry;
  return appEnv.resolveUserDataFilePath(
    `data/profiles/${projectId}/${profileName.toLowerCase()}.profile.json`,
  );
}

async function getProfileEntry(
  relativeFilePath: string,
  profilesFolderPath: string,
): Promise<IProfileEntry> {
  const projectId = pathDirname(relativeFilePath);
  const filePath = pathJoin(profilesFolderPath, relativeFilePath);
  const userProfileData = (await fsxReadJsonFile(
    filePath,
  )) as IPersistProfileFileData;
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
    const folderPath = `data/profiles/${projectId}`;
    return appEnv.resolveUserDataFilePath(folderPath);
  },
  async ensureProfilesDirectoryExists() {
    const dataDirPath = appEnv.resolveUserDataFilePath('data');
    await fsxEnsureFolderExists(dataDirPath);
    const profilesDirPath = appEnv.resolveUserDataFilePath('data/profiles');
    await fsxEnsureFolderExists(profilesDirPath);
  },
  async listAllProfileEntries(): Promise<IProfileEntry[]> {
    const profilesFolderPath = appEnv.resolveUserDataFilePath(`data/profiles`);
    const relativeFilePaths = await globAsync(
      '*/*.profile.json',
      profilesFolderPath,
    );
    return (
      await Promise.all(
        relativeFilePaths.map((relPath) =>
          getProfileEntry(relPath, profilesFolderPath),
        ),
      )
    ).filter(
      (it) =>
        validateResourceName(it.profileName, 'profile name') === undefined,
    );
  },
  async loadProfile(profileEntry: IProfileEntry): Promise<IProfileData> {
    const filePath = getProfileFilePath(profileEntry);
    const profileData = await ProfileFileLoader.loadProfileFromFile(filePath);
    profileData.projectId = profileEntry.projectId;
    return profileData;
  },
  async ensureSavingFolder(filePath: string) {
    await fsxEnsureFolderExists(pathDirname(filePath));
  },
  async saveProfile(
    profileEntry: IProfileEntry,
    profileData: IProfileData,
  ): Promise<void> {
    const filePath = getProfileFilePath(profileEntry);
    console.log(`saving current profile to ${pathBasename(filePath)}`);
    await this.ensureSavingFolder(filePath);
    await ProfileFileLoader.saveProfileToFile(
      filePath,
      profileData,
      profileEntry.profileName,
    );
  },
  async loadExternalProfileFile(filePath: string): Promise<IProfileData> {
    return await ProfileFileLoader.loadProfileFromFile(filePath);
  },
  async saveExternalProfileFile(
    filePath: string,
    profileData: IProfileData,
  ): Promise<void> {
    const profileName = pathBasename(filePath, '.profile.json');
    const baseDir = pathDirname(filePath);
    const savingFilePath = pathJoin(baseDir, profileName.toLowerCase());
    await ProfileFileLoader.saveProfileToFile(
      savingFilePath,
      profileData,
      profileName,
    );
  },
  async deleteProfile(profileEntry: IProfileEntry): Promise<void> {
    const filePath = getProfileFilePath(profileEntry);
    await fspUnlink(filePath);
    const folderPath = pathDirname(filePath);
    const fileNames = await fspReaddir(folderPath);
    if (fileNames.length === 0) {
      fsRmdirSync(folderPath);
    }
  },
  async renameProfile(
    profileEntry: IProfileEntry,
    newProfileEntry: IProfileEntry,
  ): Promise<void> {
    const srcPath = getProfileFilePath(profileEntry);
    const dstPath = getProfileFilePath(newProfileEntry);
    await fspRename(srcPath, dstPath);
  },
  async copyProfile(
    profileEntry: IProfileEntry,
    newProfileEntry: IProfileEntry,
  ): Promise<void> {
    const srcPath = getProfileFilePath(profileEntry);
    const dstPath = getProfileFilePath(newProfileEntry);
    await fspCopyFile(srcPath, dstPath);
  },
};
