import { appGlobal } from '../appGlobal';
import { resolveUserDataFilePath } from '~shell/AppEnvironment';
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

export class ProfileManagerCore {
  static getDataFilePath(profName: string): string {
    return resolveUserDataFilePath(`data/profiles/${profName}.json`);
  }

  static async ensureProfilesDirectoryExists() {
    const dataDirPath = resolveUserDataFilePath('data');
    if (!fsIsFileExists(dataDirPath)) {
      await fsCreateDirectory(dataDirPath);
    }
    const profilesDirPath = resolveUserDataFilePath('data/profiles');
    if (!fsIsFileExists(profilesDirPath)) {
      await fsCreateDirectory(profilesDirPath);
    }
  }

  static async listAllProfileNames(): Promise<string[]> {
    const fileNames = await fsListFilesInDirectory(
      resolveUserDataFilePath(`data/profiles`)
    );
    return fileNames.map((fname) => fname.replace('.json', ''));
  }

  static loadCurrentProfileName(): string | undefined {
    return appGlobal.applicationStorage.getItem('currentProfileName') as
      | string
      | undefined;
  }

  static storeCurrentProfileName(profName: string) {
    appGlobal.applicationStorage.setItem('currentProfileName', profName);
  }

  static async loadProfile(profName: string): Promise<IProfileData> {
    const fpath = this.getDataFilePath(profName);
    return (await fsxReadJsonFile(fpath)) as IProfileData;
  }

  static async saveProfile(
    profName: string,
    profileData: IProfileData
  ): Promise<void> {
    const fpath = this.getDataFilePath(profName);
    console.log(`saving current profile to ${path.basename(fpath)}`);
    await fsxWriteJsonFile(fpath, profileData);
  }

  static async createProfile(
    profName: string,
    breedName: string
  ): Promise<IProfileData> {
    const profileData: IProfileData = duplicateObjectByJsonStringifyParse(
      fallbackProfileData
    );
    const keyboardShape = appGlobal.shapeProvider.getKeyboardShapeByBreedName(
      breedName
    );
    if (keyboardShape) {
      profileData.keyboardShape = keyboardShape;
    }
    await this.saveProfile(profName, profileData);
    return profileData;
  }

  static async deleteProfile(profName: string): Promise<void> {
    const fpath = this.getDataFilePath(profName);
    await fsDeleteFile(fpath);
  }

  static async renameProfile(
    profName: string,
    newProfName: string
  ): Promise<void> {
    const srcPath = this.getDataFilePath(profName);
    const dstPath = this.getDataFilePath(newProfName);
    await fsRenameFile(srcPath, dstPath);
  }

  static async copyProfile(
    profName: string,
    newProfName: string
  ): Promise<void> {
    const srcPath = this.getDataFilePath(profName);
    const dstPath = this.getDataFilePath(newProfName);
    await fsCopyFile(srcPath, dstPath);
  }
}
