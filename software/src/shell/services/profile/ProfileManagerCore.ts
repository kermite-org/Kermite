import { IProfileData } from '~/shared';
import { appEnv } from '~/shell/base/AppEnv';
import {
  fsExistsSync,
  fspCopyFile,
  fspMkdir,
  fspReaddir,
  fspRename,
  fspUnlink,
  fsxMkdirpSync,
  pathBasename,
  pathDirname,
} from '~/shell/funcs';
import { ProfileFileLoader } from '~/shell/loaders/ProfileFileLoader';

export class ProfileManagerCore {
  getDataFilePath(profName: string): string {
    return appEnv.resolveUserDataFilePath(`data/profiles/${profName}.json`);
  }

  async ensureProfilesDirectoryExists() {
    const dataDirPath = appEnv.resolveUserDataFilePath('data');
    if (!fsExistsSync(dataDirPath)) {
      await fspMkdir(dataDirPath);
    }
    const profilesDirPath = appEnv.resolveUserDataFilePath('data/profiles');
    if (!fsExistsSync(profilesDirPath)) {
      await fspMkdir(profilesDirPath);
    }
  }

  async listAllProfileNames(): Promise<string[]> {
    const fileNames = await fspReaddir(
      appEnv.resolveUserDataFilePath(`data/profiles`),
    );
    return fileNames
      .filter((fname) => fname.endsWith('.json'))
      .map((fname) => pathBasename(fname, '.json'));
  }

  async loadProfile(profName: string): Promise<IProfileData> {
    const filePath = this.getDataFilePath(profName);
    return await ProfileFileLoader.loadProfileFromFile(filePath);
  }

  async saveProfile(
    profName: string,
    profileData: IProfileData,
  ): Promise<void> {
    const filePath = this.getDataFilePath(profName);
    console.log(`saving current profile to ${pathBasename(filePath)}`);
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

  async saveProfileAsPreset(
    filePath: string,
    profileData: IProfileData,
  ): Promise<void> {
    console.log(`saving current profile to ${filePath}`);
    fsxMkdirpSync(pathDirname(filePath));
    await ProfileFileLoader.saveProfileToFile(filePath, profileData);
  }

  async deleteProfile(profName: string): Promise<void> {
    const fpath = this.getDataFilePath(profName);
    await fspUnlink(fpath);
  }

  async renameProfile(profName: string, newProfName: string): Promise<void> {
    const srcPath = this.getDataFilePath(profName);
    const dstPath = this.getDataFilePath(newProfName);
    await fspRename(srcPath, dstPath);
  }

  async copyProfile(profName: string, newProfName: string): Promise<void> {
    const srcPath = this.getDataFilePath(profName);
    const dstPath = this.getDataFilePath(newProfName);
    await fspCopyFile(srcPath, dstPath);
  }
}
