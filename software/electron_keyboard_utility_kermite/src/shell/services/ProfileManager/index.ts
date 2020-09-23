import {
  IProfileManagerStatus,
  IProfileManagerCommand
} from '~defs/IpcContract';
import { clampValue, removeArrayItems } from '~funcs/Utils';
import { IProfileData } from '~defs/ProfileData';
import { ProfileManagerCore } from './ProfileManagerCore';
import { ApplicationStorage } from '../ApplicationStorage';
import { KeyboardShapesProvider } from '../KeyboardShapesProvider';

type StatusListener = (partialStatus: Partial<IProfileManagerStatus>) => void;

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

  private core: ProfileManagerCore;
  constructor(
    applicationStorage: ApplicationStorage,
    shapeProvider: KeyboardShapesProvider
  ) {
    this.core = new ProfileManagerCore(applicationStorage, shapeProvider);
  }

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
    const allProfileNames = await this.core.listAllProfileNames();
    if (allProfileNames.length === 0) {
      const profName = this.defaultProfileName;
      await this.core.createProfile(profName, '__default');
      allProfileNames.push(profName);
    }
    return allProfileNames;
  }

  private getInitialProfileName(allProfileNames: string[]): string {
    let profName = this.core.loadCurrentProfileName();
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
      await this.core.ensureProfilesDirectoryExists();
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
    this.core.storeCurrentProfileName(this.status.currentProfileName);
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
      const profileData = await this.core.loadProfile(profName);
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
      this.core.saveProfile(this.status.currentProfileName, profileData);
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
      const profileData = await this.core.createProfile(profName, breedName);
      const allProfileNames = await this.core.listAllProfileNames();
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
      await this.core.deleteProfile(profName);
      if (isLastOne) {
        await this.core.createProfile(this.defaultProfileName, '__default');
      }
      const allProfileNames = await this.core.listAllProfileNames();
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
      await this.core.renameProfile(profName, newProfName);
      const allProfileNames = await this.core.listAllProfileNames();
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
      await this.core.copyProfile(profName, newProfName);
      const allProfileNames = await this.core.listAllProfileNames();
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
