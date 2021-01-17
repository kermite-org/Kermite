import { IProfileData } from '@shared';
import { applicationStorage } from '@shell/base';
import { appEnv } from '@shell/base/AppEnv';
import {
  fsExistsSync,
  fspCopyFile,
  fspMkdir,
  fspReaddir,
  fspRename,
  fspUnlink,
  fsxReadJsonFile,
  fsxWriteJsonFile,
  pathBasename,
} from '@shell/funcs';

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
    return fileNames.map((fname) => pathBasename(fname, '.json'));
  }

  loadCurrentProfileName(): string | undefined {
    return applicationStorage.getItem('currentProfileName');
  }

  storeCurrentProfileName(profName: string) {
    applicationStorage.setItem('currentProfileName', profName);
  }

  async loadProfile(profName: string): Promise<IProfileData> {
    const fpath = this.getDataFilePath(profName);
    return (await fsxReadJsonFile(fpath)) as IProfileData;
  }

  async saveProfile(
    profName: string,
    profileData: IProfileData,
  ): Promise<void> {
    const fpath = this.getDataFilePath(profName);
    console.log(`saving current profile to ${pathBasename(fpath)}`);
    await fsxWriteJsonFile(fpath, profileData);
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
