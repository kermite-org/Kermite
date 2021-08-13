import { IPersistProfileData, IProfileData, IProfileEntry } from '~/shared';
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
} from '~/shell/funcs';
import { ProfileFileLoader } from '~/shell/loaders/ProfileFileLoader';

export class ProfileManagerCore {
  getProfilesFolderPath(projectId: string | undefined): string {
    const folderPath = projectId
      ? `data/profiles/${projectId}`
      : `data/profiles`;
    return appEnv.resolveUserDataFilePath(folderPath);
  }

  private getProfileFilePath(profName: string): string {
    return appEnv.resolveUserDataFilePath(
      `data/profiles/${profName}.profile.json`,
    );
  }

  async ensureProfilesDirectoryExists() {
    const dataDirPath = appEnv.resolveUserDataFilePath('data');
    await fsxEnsureFolderExists(dataDirPath);
    const profilesDirPath = appEnv.resolveUserDataFilePath('data/profiles');
    await fsxEnsureFolderExists(profilesDirPath);
  }

  private async listAllProfileNames(): Promise<string[]> {
    const profilesFolderPath = appEnv.resolveUserDataFilePath(`data/profiles`);
    const fileNames = await globAsync('**/*.profile.json', profilesFolderPath);
    return fileNames.map((fname) => fname.replace('.profile.json', ''));
  }

  async listAllProfileEntries(): Promise<IProfileEntry[]> {
    const allProfileNames = await this.listAllProfileNames();
    return await Promise.all(
      allProfileNames.map(async (profileName) => {
        const filePath = this.getProfileFilePath(profileName);
        const profileData = (await fsxReadJsonFile(
          filePath,
        )) as IPersistProfileData;
        const projectId = profileData.projectId || '';
        return {
          profileName,
          projectId,
        };
      }),
    );
  }

  async loadProfile(profName: string): Promise<IProfileData> {
    const filePath = this.getProfileFilePath(profName);
    return await ProfileFileLoader.loadProfileFromFile(filePath);
  }

  private async ensureSavingFolder(filePath: string) {
    await fsxEnsureFolderExists(pathDirname(filePath));
  }

  async saveProfile(
    profName: string,
    profileData: IProfileData,
  ): Promise<void> {
    const filePath = this.getProfileFilePath(profName);
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

  async deleteProfile(profName: string): Promise<void> {
    const fpath = this.getProfileFilePath(profName);
    await fspUnlink(fpath);
    const folderPath = pathDirname(fpath);
    const fileNames = await fspReaddir(folderPath);
    if (fileNames.length === 0) {
      fsRmdirSync(folderPath);
    }
  }

  async renameProfile(profName: string, newProfName: string): Promise<void> {
    const srcPath = this.getProfileFilePath(profName);
    const dstPath = this.getProfileFilePath(newProfName);
    await fspRename(srcPath, dstPath);
  }

  async copyProfile(profName: string, newProfName: string): Promise<void> {
    const srcPath = this.getProfileFilePath(profName);
    const dstPath = this.getProfileFilePath(newProfName);
    await fspCopyFile(srcPath, dstPath);
  }
}
