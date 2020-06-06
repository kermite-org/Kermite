import { appGlobal } from './appGlobal';
import { IProfileManagerStatus } from '~defs/ipc';
import { resolveFilePath } from '~shell/AppEnvironment';
import {
  duplicateObjectByJsonStringifyParse,
  clampValue,
  removeArrayItems
} from '~funcs/Utils';
import * as path from 'path';
import { IProfileManagerCommand } from '~defs/ipc';
import { IProfileData, fallbackProfileData } from '~defs/ProfileData';
import { keyboardShapes } from '~defs/keyboardShapes';
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

type StatusListener = (partialStatus: Partial<IProfileManagerStatus>) => void;

class ProfileManagerCore {
  static getDataFilePath(profName: string): string {
    return resolveFilePath(`data/profiles/${profName}.json`);
  }

  static async ensureProfilesDirectoryExists() {
    const dataDirPath = resolveFilePath('data');
    if (!fsIsFileExists(dataDirPath)) {
      await fsCreateDirectory(dataDirPath);
    }
    const profilesDirPath = resolveFilePath('data/profiles');
    if (!fsIsFileExists(profilesDirPath)) {
      await fsCreateDirectory(profilesDirPath);
    }
  }

  static async listAllProfileNames(): Promise<string[]> {
    const fileNames = await fsListFilesInDirectory(
      resolveFilePath(`data/profiles`)
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
    // eslint-disable-next-line no-console
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
    const keyboardShape = keyboardShapes.find(
      (it) => it.breedName === breedName
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

export class ProfileManager {
  private status: IProfileManagerStatus = {
    currentProfileName: '',
    allProfileNames: [],
    loadedProfileData: undefined,
    errorMessage: ''
  };

  private defaultProfileName = 'default';

  private statusListeners: StatusListener[] = [];

  private savingProfileData: IProfileData | undefined = undefined;

  getCurrentProfile(): IProfileData | undefined {
    return this.status.loadedProfileData;
  }

  subscribeStatus(listener: StatusListener) {
    this.statusListeners.push(listener);
    listener(this.status);
  }
  unsubscribeStatus(listener: StatusListener) {
    removeArrayItems(this.statusListeners, listener);
  }

  private setStatus(newStatePartial: Partial<IProfileManagerStatus>) {
    this.status = { ...this.status, ...newStatePartial };
    this.statusListeners.forEach((listener) => listener(newStatePartial));
  }

  private async initializeProfileList(): Promise<string[]> {
    const allProfileNames = await ProfileManagerCore.listAllProfileNames();
    if (allProfileNames.length === 0) {
      const profName = this.defaultProfileName;
      await ProfileManagerCore.createProfile(profName, '__default');
      allProfileNames.push(profName);
    }
    return allProfileNames;
  }

  private getInitialProfileName(allProfileNames: string[]): string {
    let profName = ProfileManagerCore.loadCurrentProfileName();
    if (profName && !allProfileNames.includes(profName)) {
      profName = undefined;
    }
    if (!profName) {
      profName = allProfileNames[0];
    }
    return profName;
  }

  async initialize() {
    try {
      await ProfileManagerCore.ensureProfilesDirectoryExists();
      const allProfileNames = await this.initializeProfileList();
      const initialProfileName = this.getInitialProfileName(allProfileNames);
      this.setStatus({ allProfileNames });
      await this.loadProfile(initialProfileName);
    } catch (error) {
      //todo: check various cases
      //todo: check error when data or data/profiles is not exists
    }
  }

  async terminate() {
    await this.executeSaveProfileTask();
    ProfileManagerCore.storeCurrentProfileName(this.status.currentProfileName);
  }

  private fixProfileData(profileData: IProfileData) {
    for (const la of profileData.layers) {
      if (la.defaultScheme === undefined) {
        la.defaultScheme = 'block';
      }
    }
    if (!profileData.assignType) {
      (profileData as any).assignType = 'single';
    }

    if (!profileData.settings) {
      if (profileData.assignType === 'single') {
        profileData.settings = {};
      }
      if (profileData.assignType === 'dual') {
        profileData.settings = {
          type: 'dual',
          primaryDefaultTrigger: 'down',
          tapHoldThresholdMs: 200,
          useInterruptHold: true
        };
      }
    }
  }

  private raiseErrorMessage(errorMessage: string) {
    this.setStatus({ errorMessage });
  }

  async loadProfile(profName: string): Promise<boolean> {
    try {
      const profileData = await ProfileManagerCore.loadProfile(profName);
      this.fixProfileData(profileData);
      this.setStatus({
        currentProfileName: profName,
        loadedProfileData: profileData
      });
      return true;
    } catch (error) {
      this.raiseErrorMessage('failed to load profile');
      return false;
    }
  }

  async saveCurrentProfile(profileData: IProfileData): Promise<boolean> {
    try {
      ProfileManagerCore.saveProfile(
        this.status.currentProfileName,
        profileData
      );
      this.setStatus({
        loadedProfileData: profileData
      });
      return true;
    } catch (error) {
      this.raiseErrorMessage('failed to save profile');
      return false;
    }
  }

  reserveSaveProfileTask(prof: IProfileData) {
    //console.log(`reserveSaveProfileTask`)
    this.savingProfileData = prof;
  }

  private async executeSaveProfileTask() {
    //console.log(`execute save profile task ${!!this.savingEditModel}`)
    if (this.savingProfileData) {
      await this.saveCurrentProfile(this.savingProfileData);
      this.savingProfileData = undefined;
      //console.log(`execute save done`)
    }
  }

  async createProfile(profName: string, breedName: string): Promise<boolean> {
    if (this.status.allProfileNames.includes(profName)) {
      return false;
    }
    try {
      const profileData = await ProfileManagerCore.createProfile(
        profName,
        breedName
      );
      const allProfileNames = await ProfileManagerCore.listAllProfileNames();
      this.setStatus({
        allProfileNames,
        currentProfileName: profName,
        loadedProfileData: profileData
      });
      return true;
    } catch (error) {
      this.raiseErrorMessage('failed to create profile');
      return false;
    }
  }

  async deleteProfile(profName: string): Promise<boolean> {
    if (!this.status.allProfileNames.includes(profName)) {
      return false;
    }
    try {
      const isCurrent = this.status.currentProfileName === profName;
      const currentProfileIndex = this.status.allProfileNames.indexOf(profName);
      const isLastOne = this.status.allProfileNames.length === 1;
      await ProfileManagerCore.deleteProfile(profName);
      if (isLastOne) {
        await ProfileManagerCore.createProfile(
          this.defaultProfileName,
          '__default'
        );
      }
      const allProfileNames = await ProfileManagerCore.listAllProfileNames();
      this.setStatus({ allProfileNames });
      if (isCurrent) {
        const newIndex = clampValue(
          currentProfileIndex,
          0,
          this.status.allProfileNames.length - 1
        );
        await this.loadProfile(allProfileNames[newIndex]);
      }
      return true;
    } catch (error) {
      this.raiseErrorMessage('failed to delete profile');
      return false;
    }
  }

  async renameProfile(profName: string, newProfName: string): Promise<boolean> {
    if (!this.status.allProfileNames.includes(profName)) {
      return false;
    }
    if (this.status.allProfileNames.includes(newProfName)) {
      return false;
    }
    try {
      const isCurrent = this.status.currentProfileName === profName;
      await ProfileManagerCore.renameProfile(profName, newProfName);
      const allProfileNames = await ProfileManagerCore.listAllProfileNames();
      this.setStatus({ allProfileNames });
      if (isCurrent) {
        await this.loadProfile(newProfName);
      }
      return true;
    } catch (error) {
      this.raiseErrorMessage('failed to rename profile');
      return false;
    }
  }

  async copyProfile(profName: string, newProfName: string): Promise<boolean> {
    if (!this.status.allProfileNames.includes(profName)) {
      return false;
    }
    if (this.status.allProfileNames.includes(newProfName)) {
      return false;
    }
    try {
      await ProfileManagerCore.copyProfile(profName, newProfName);
      const allProfileNames = await ProfileManagerCore.listAllProfileNames();
      this.setStatus({ allProfileNames });
      await this.loadProfile(newProfName);
      return true;
    } catch (error) {
      this.raiseErrorMessage('failed to copy profile');
      return false;
    }
  }

  private async executeCommand(cmd: IProfileManagerCommand): Promise<boolean> {
    if (cmd.creatProfile) {
      return await this.createProfile(
        cmd.creatProfile.name,
        cmd.creatProfile.breedName
      );
    } else if (cmd.deleteProfile) {
      return await this.deleteProfile(cmd.deleteProfile.name);
    } else if (cmd.loadProfile) {
      return await this.loadProfile(cmd.loadProfile.name);
    } else if (cmd.renameProfile) {
      return await this.renameProfile(
        cmd.renameProfile.name,
        cmd.renameProfile.newName
      );
    } else if (cmd.copyProfile) {
      return await this.copyProfile(
        cmd.copyProfile.name,
        cmd.copyProfile.newName
      );
    } else if (cmd.saveCurrentProfile) {
      return await this.saveCurrentProfile(cmd.saveCurrentProfile.profileData);
    }
    return false;
  }

  async executeCommands(commands: IProfileManagerCommand[]) {
    for (const cmd of commands) {
      const done = await this.executeCommand(cmd);
      if (!done) {
        return;
      }
    }
  }
}
