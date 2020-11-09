import { IProfileData, fallbackProfileData } from '~defs/ProfileData';
import {
  fsIsFileExists,
  fsCreateDirectory,
  fsListFilesInDirectory,
  fsxWriteJsonFile,
  fsRenameFile,
  fsDeleteFile,
  fsCopyFile,
  fsxReadJsonFile,
  pathBaseName
} from '~funcs/Files';
import { duplicateObjectByJsonStringifyParse } from '~funcs/Utils';
import { appEnv } from '~shell/base/AppEnvironment';
import { applicationStorage } from '~shell/services/ApplicationStorage';
import { KeyboardShapesProvider } from '../KeyboardShape/KeyboardShapesProvider';

export class ProfileManagerCore {
  constructor(private shapesProvider: KeyboardShapesProvider) {}

  getDataFilePath(profName: string): string {
    return appEnv.resolveUserDataFilePath(`data/profiles/${profName}.json`);
  }

  async ensureProfilesDirectoryExists() {
    const dataDirPath = appEnv.resolveUserDataFilePath('data');
    if (!fsIsFileExists(dataDirPath)) {
      await fsCreateDirectory(dataDirPath);
    }
    const profilesDirPath = appEnv.resolveUserDataFilePath('data/profiles');
    if (!fsIsFileExists(profilesDirPath)) {
      await fsCreateDirectory(profilesDirPath);
    }
  }

  async listAllProfileNames(): Promise<string[]> {
    const fileNames = await fsListFilesInDirectory(
      appEnv.resolveUserDataFilePath(`data/profiles`)
    );
    return fileNames.map((fname) => pathBaseName(fname, '.json'));
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
    profileData: IProfileData
  ): Promise<void> {
    const fpath = this.getDataFilePath(profName);
    console.log(`saving current profile to ${pathBaseName(fpath)}`);
    await fsxWriteJsonFile(fpath, profileData);
  }

  async createProfile(
    profName: string,
    targetProjectId: string
  ): Promise<IProfileData> {
    const profileData: IProfileData = duplicateObjectByJsonStringifyParse(
      fallbackProfileData
    );
    const keyboardShape = await this.shapesProvider.loadKeyboardShapeByProjectId(
      targetProjectId
    );
    if (keyboardShape) {
      profileData.keyboardShape = keyboardShape;
    }
    await this.saveProfile(profName, profileData);
    return profileData;
  }

  async deleteProfile(profName: string): Promise<void> {
    const fpath = this.getDataFilePath(profName);
    await fsDeleteFile(fpath);
  }

  async renameProfile(profName: string, newProfName: string): Promise<void> {
    const srcPath = this.getDataFilePath(profName);
    const dstPath = this.getDataFilePath(newProfName);
    await fsRenameFile(srcPath, dstPath);
  }

  async copyProfile(profName: string, newProfName: string): Promise<void> {
    const srcPath = this.getDataFilePath(profName);
    const dstPath = this.getDataFilePath(newProfName);
    await fsCopyFile(srcPath, dstPath);
  }
}
