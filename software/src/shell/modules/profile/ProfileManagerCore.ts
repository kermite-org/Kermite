import { validateResourceName, IProfileData, IProfileEntry } from '~/shared';
import { appEnv } from '~/shell/base/AppEnv';
import {
  fspCopyFile,
  fspReaddir,
  fspRename,
  fspUnlink,
  fsRmdirSync,
  fsxEnsureFolderExists,
  globAsync,
  pathBasename,
  pathDirname,
} from '~/shell/funcs';
import { ProfileFileLoader } from '~/shell/loaders/ProfileFileLoader';

function getProfileFilePath(profileEntry: IProfileEntry): string {
  const { projectId, profileName } = profileEntry;
  return appEnv.resolveUserDataFilePath(
    `data/profiles/${projectId}/${profileName}.profile.json`,
  );
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
    const filePaths = await globAsync('*/*.profile.json', profilesFolderPath);
    return filePaths
      .map((filePath) => {
        const projectId = pathDirname(filePath);
        const profileName = pathBasename(filePath, '.profile.json');
        return {
          projectId,
          profileName,
        };
      })
      .filter(
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
    await ProfileFileLoader.saveProfileToFile(filePath, profileData);
  },
  async loadExternalProfileFile(filePath: string): Promise<IProfileData> {
    return await ProfileFileLoader.loadProfileFromFile(filePath);
  },
  async saveExternalProfileFile(
    filePath: string,
    profileData: IProfileData,
  ): Promise<void> {
    await ProfileFileLoader.saveProfileToFile(filePath, profileData);
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
