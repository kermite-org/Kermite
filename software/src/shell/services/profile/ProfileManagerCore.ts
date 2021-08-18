import { IProfileData, IProfileEntry } from '~/shared';
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

export class ProfileManagerCore {
  getProfilesFolderPath(profileEntry: IProfileEntry): string {
    const { projectId } = profileEntry;
    const folderPath = `data/profiles/${projectId}`;
    return appEnv.resolveUserDataFilePath(folderPath);
  }

  private getProfileFilePath(profileEntry: IProfileEntry): string {
    const { projectId, profileName } = profileEntry;
    return appEnv.resolveUserDataFilePath(
      `data/profiles/${projectId}/${profileName}.profile.json`,
    );
  }

  async ensureProfilesDirectoryExists() {
    const dataDirPath = appEnv.resolveUserDataFilePath('data');
    await fsxEnsureFolderExists(dataDirPath);
    const profilesDirPath = appEnv.resolveUserDataFilePath('data/profiles');
    await fsxEnsureFolderExists(profilesDirPath);
  }

  async listAllProfileEntries(): Promise<IProfileEntry[]> {
    const profilesFolderPath = appEnv.resolveUserDataFilePath(`data/profiles`);
    const filePaths = await globAsync('*/*.profile.json', profilesFolderPath);
    return filePaths.map((filePath) => {
      const projectId = pathDirname(filePath);
      const profileName = pathBasename(filePath, '.profile.json');
      return {
        projectId,
        profileName,
      };
    });
  }

  async loadProfile(profileEntry: IProfileEntry): Promise<IProfileData> {
    const filePath = this.getProfileFilePath(profileEntry);
    const profileData = await ProfileFileLoader.loadProfileFromFile(filePath);
    profileData.projectId = profileEntry.projectId;
    return profileData;
  }

  private async ensureSavingFolder(filePath: string) {
    await fsxEnsureFolderExists(pathDirname(filePath));
  }

  async saveProfile(
    profileEntry: IProfileEntry,
    profileData: IProfileData,
  ): Promise<void> {
    const filePath = this.getProfileFilePath(profileEntry);
    console.log(`saving current profile to ${pathBasename(filePath)}`);
    await this.ensureSavingFolder(filePath);
    await ProfileFileLoader.saveProfileToFile(filePath, profileData);
  }

  async loadExternalProfileFile(filePath: string): Promise<IProfileData> {
    return await ProfileFileLoader.loadProfileFromFile(filePath);
  }

  async saveExternalProfileFile(
    filePath: string,
    profileData: IProfileData,
  ): Promise<void> {
    await ProfileFileLoader.saveProfileToFile(filePath, profileData);
  }

  async deleteProfile(profileEntry: IProfileEntry): Promise<void> {
    const filePath = this.getProfileFilePath(profileEntry);
    await fspUnlink(filePath);
    const folderPath = pathDirname(filePath);
    const fileNames = await fspReaddir(folderPath);
    if (fileNames.length === 0) {
      fsRmdirSync(folderPath);
    }
  }

  async renameProfile(
    profileEntry: IProfileEntry,
    newProfileEntry: IProfileEntry,
  ): Promise<void> {
    const srcPath = this.getProfileFilePath(profileEntry);
    const dstPath = this.getProfileFilePath(newProfileEntry);
    await fspRename(srcPath, dstPath);
  }

  async copyProfile(
    profileEntry: IProfileEntry,
    newProfileEntry: IProfileEntry,
  ): Promise<void> {
    const srcPath = this.getProfileFilePath(profileEntry);
    const dstPath = this.getProfileFilePath(newProfileEntry);
    await fspCopyFile(srcPath, dstPath);
  }
}
