import {
  IProfileManagerStatus,
  IProfileData,
  duplicateObjectByJsonStringifyParse,
  fallbackProfileData,
  clampValue,
  IProfileManagerCommand,
  addArrayItemIfNotExist,
  IPresetSpec,
} from '~/shared';
import { EventPort } from '~/shell/funcs';
import { projectResourceInfoProvider } from '~/shell/projects';
import { PresetProfileLoader } from '~/shell/projects/PresetProfileLoader';
import { ProfileManagerCore } from './ProfileManagerCore';
import { IProfileManager } from './interfaces';

const defaultProfileName = 'default';

// プロファイルを<UserDataDir>/data/profiles以下でファイルとして管理
export class ProfileManager implements IProfileManager {
  private status: IProfileManagerStatus = {
    currentProfileName: '',
    allProfileNames: [],
    loadedProfileData: undefined,
    errorMessage: '',
  };

  private savingProfileData: IProfileData | undefined = undefined;

  private core: ProfileManagerCore;

  constructor(private presetProfileLoader: PresetProfileLoader) {
    this.core = new ProfileManagerCore();
  }

  getStatus() {
    return this.status;
  }

  getCurrentProfile(): IProfileData | undefined {
    return this.status.loadedProfileData;
  }

  readonly statusEventPort = new EventPort<Partial<IProfileManagerStatus>>({
    initialValueGetter: () => this.status,
  });

  private setStatus(newStatePartial: Partial<IProfileManagerStatus>) {
    this.status = { ...this.status, ...newStatePartial };
    this.statusEventPort.emit(newStatePartial);
  }

  private async initializeProfileList(): Promise<string[]> {
    const allProfileNames = await this.core.listAllProfileNames();
    if (allProfileNames.length === 0) {
      const profName = defaultProfileName;
      this.createDefaultProfile(profName);
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

  async initializeAsync() {
    try {
      await this.core.ensureProfilesDirectoryExists();
      const allProfileNames = await this.initializeProfileList();
      const initialProfileName = this.getInitialProfileName(allProfileNames);
      this.setStatus({ allProfileNames });
      await this.loadProfile(initialProfileName);

      // debug
      // setTimeout(() => {
      //   const idx = (Math.random() * (allProfileNames.length - 1)) >> 0;
      //   console.log({ name: this.status.allProfileNames, idx });
      //   this.loadProfile(this.status.allProfileNames[idx]);
      // }, 3000);
    } catch (error) {
      // todo: check various cases
      // todo: check error when data or data/profiles is not exists
    }
  }

  async terminateAsync() {
    await this.executeSaveProfileTask();
    this.core.storeCurrentProfileName(this.status.currentProfileName);
  }

  private raiseErrorMessage(errorMessage: string) {
    this.setStatus({ errorMessage });
  }

  async loadProfile(profName: string): Promise<boolean> {
    try {
      const profileData = await this.core.loadProfile(profName);
      this.setStatus({
        currentProfileName: profName,
        loadedProfileData: profileData,
      });
      return true;
    } catch (error) {
      this.raiseErrorMessage(`failed to load profile, ${error.message}`);
      return false;
    }
  }

  async saveCurrentProfile(profileData: IProfileData): Promise<boolean> {
    try {
      this.core.saveProfile(this.status.currentProfileName, profileData);
      this.setStatus({
        loadedProfileData: profileData,
      });
      return true;
    } catch (error) {
      this.raiseErrorMessage('failed to save profile');
      return false;
    }
  }

  async saveAsProjectPreset(
    projectId: string,
    presetName: string,
    profileData: IProfileData,
  ): Promise<boolean> {
    try {
      const filePath = projectResourceInfoProvider.getPresetProfileFilePath(
        projectId,
        presetName,
      );
      if (filePath) {
        await this.core.saveProfileAsPreset(filePath, profileData);
        projectResourceInfoProvider.patchProjectInfoSource(projectId, (info) =>
          addArrayItemIfNotExist(info.presetNames, presetName),
        );
      }
      return true;
    } catch (error) {
      this.raiseErrorMessage('failed to save preset');
      return false;
    }
  }

  reserveSaveProfileTask(prof: IProfileData) {
    // console.log(`reserveSaveProfileTask`)
    this.savingProfileData = prof;
  }

  private async executeSaveProfileTask() {
    // console.log(`execute save profile task ${!!this.savingEditModel}`)
    if (this.savingProfileData) {
      await this.saveCurrentProfile(this.savingProfileData);
      this.savingProfileData = undefined;
      // console.log(`execute save done`)
    }
  }

  private async createDefaultProfile(profName: string) {
    const profile = duplicateObjectByJsonStringifyParse(fallbackProfileData);
    await this.core.saveProfile(profName, profile);
  }

  private async createProfileImpl(
    profName: string,
    projectId: string,
    presetSpec: IPresetSpec,
  ): Promise<IProfileData> {
    const profile = await this.presetProfileLoader.loadPresetProfileData(
      projectId,
      presetSpec,
    );
    if (!profile) {
      throw new Error('failed to load profile');
    }
    await this.core.saveProfile(profName, profile);
    return profile;
  }

  async createProfile(
    profName: string,
    projectId: string,
    presetSpec: IPresetSpec,
  ): Promise<boolean> {
    if (this.status.allProfileNames.includes(profName)) {
      return false;
    }
    try {
      const profileData = await this.createProfileImpl(
        profName,
        projectId,
        presetSpec,
      );
      const allProfileNames = await this.core.listAllProfileNames();
      this.setStatus({
        allProfileNames,
        currentProfileName: profName,
        loadedProfileData: profileData,
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
        await this.createDefaultProfile(defaultProfileName);
      }
      const allProfileNames = await this.core.listAllProfileNames();
      this.setStatus({ allProfileNames });
      if (isCurrent) {
        const newIndex = clampValue(
          currentProfileIndex,
          0,
          this.status.allProfileNames.length - 1,
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
    // console.log(`execute command`, { cmd });
    if (cmd.creatProfile) {
      return await this.createProfile(
        cmd.creatProfile.name,
        cmd.creatProfile.targetProjectId,
        cmd.creatProfile.presetSpec,
      );
    } else if (cmd.deleteProfile) {
      return await this.deleteProfile(cmd.deleteProfile.name);
    } else if (cmd.loadProfile) {
      return await this.loadProfile(cmd.loadProfile.name);
    } else if (cmd.renameProfile) {
      return await this.renameProfile(
        cmd.renameProfile.name,
        cmd.renameProfile.newName,
      );
    } else if (cmd.copyProfile) {
      return await this.copyProfile(
        cmd.copyProfile.name,
        cmd.copyProfile.newName,
      );
    } else if (cmd.saveCurrentProfile) {
      return await this.saveCurrentProfile(cmd.saveCurrentProfile.profileData);
    } else if (cmd.saveAsProjectPreset) {
      const { projectId, presetName, profileData } = cmd.saveAsProjectPreset;
      return await this.saveAsProjectPreset(projectId, presetName, profileData);
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
