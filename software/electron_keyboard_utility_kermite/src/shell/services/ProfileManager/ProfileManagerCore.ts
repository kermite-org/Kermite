import { resolveUserDataFilePath } from '~shell/base/AppEnvironment';
import { duplicateObjectByJsonStringifyParse } from '~funcs/Utils';
import * as path from 'path';
import { IProfileData, fallbackProfileData } from '~defs/ProfileData';
import {
  fsIsFileExists,
  fsCreateDirectory,
  fsListFilesInDirectory,
  fsxWriteJsonFile,
  fsRenameFile,
  fsDeleteFile,
  fsCopyFile,
  fsxReadJsonFile
} from '~funcs/Files';
import { keyboardShapesProvider } from '../KeyboardShapesProvider';
import { applicationStorage } from '../ApplicationStorage';

export class ProfileManagerCore {
  constructor() {}

  getDataFilePath(profName: string): string {
    return resolveUserDataFilePath(`data/profiles/${profName}.json`);
  }

  async ensureProfilesDirectoryExists() {
    const dataDirPath = resolveUserDataFilePath('data');
    if (!fsIsFileExists(dataDirPath)) {
      await fsCreateDirectory(dataDirPath);
    }
    const profilesDirPath = resolveUserDataFilePath('data/profiles');
    if (!fsIsFileExists(profilesDirPath)) {
      await fsCreateDirectory(profilesDirPath);
    }
  }

  async listAllProfileNames(): Promise<string[]> {
    const fileNames = await fsListFilesInDirectory(
      resolveUserDataFilePath(`data/profiles`)
    );
    return fileNames.map((fname) => fname.replace('.json', ''));
  }

  loadCurrentProfileName(): string | undefined {
    return applicationStorage.getItem('currentProfileName') as
      | string
      | undefined;
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
    console.log(`saving current profile to ${path.basename(fpath)}`);
    await fsxWriteJsonFile(fpath, profileData);
  }

  async createProfile(
    profName: string,
    breedName: string
  ): Promise<IProfileData> {
    const profileData: IProfileData = duplicateObjectByJsonStringifyParse(
      fallbackProfileData
    );
    const keyboardShape = keyboardShapesProvider.getKeyboardShapeByBreedName(
      breedName
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
