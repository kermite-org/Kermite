import {
  IProfileManagerStatus,
  IProfileData,
  duplicateObjectByJsonStringifyParse,
  fallbackProfileData,
  clampValue,
  IProfileManagerCommand,
  IPresetSpec,
  IResourceOrigin,
} from '~/shared';
import { appGlobal } from '~/shell/base';
import { EventPort } from '~/shell/funcs';
import { projectResourceProvider } from '~/shell/projectResources';
import { PresetProfileLoader } from '~/shell/services/profile/PresetProfileLoader';
import { ProfileManagerCore } from './ProfileManagerCore';
import { IProfileManager } from './interfaces';

const defaultProfileName = 'default';

// プロファイルを<UserDataDir>/data/profiles以下でファイルとして管理
export class ProfileManager implements IProfileManager {
  private status: IProfileManagerStatus = {
    currentProfileName: '',
    allProfileNames: [],
    loadedProfileData: undefined,
  };

  private savingProfileData: IProfileData | undefined = undefined;

  private core: ProfileManagerCore;

  constructor(private presetProfileLoader: PresetProfileLoader) {
    this.core = new ProfileManagerCore();

    appGlobal.currentProfileGetter = this.getCurrentProfile.bind(this);
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
    await this.core.ensureProfilesDirectoryExists();
    const allProfileNames = await this.initializeProfileList();
    const initialProfileName = this.getInitialProfileName(allProfileNames);
    this.setStatus({ allProfileNames });
    await this.loadProfile(initialProfileName);
  }

  async terminateAsync() {
    await this.executeSaveProfileTask();
    this.core.storeCurrentProfileName(this.status.currentProfileName);
  }

  async loadProfile(profName: string) {
    const profileData = await this.core.loadProfile(profName);
    this.setStatus({
      currentProfileName: profName,
      loadedProfileData: profileData,
    });
  }

  async saveCurrentProfile(profileData: IProfileData) {
    await this.core.saveProfile(this.status.currentProfileName, profileData);
    this.setStatus({
      loadedProfileData: profileData,
    });
  }

  private async saveAsProjectPreset(
    projectId: string,
    presetName: string,
    profileData: IProfileData,
  ): Promise<void> {
    const filePath = projectResourceProvider.localResourceProviderImpl.getLocalPresetProfileFilePath(
      projectId,
      presetName,
    );
    if (filePath) {
      await this.core.saveProfileAsPreset(filePath, profileData);
      // projectResourceProvider.localResourceProviderImpl.patchLocalProjectInfoSource(
      //   projectId,
      //   (info) => addArrayItemIfNotExist(info.presetNames, presetName),
      // );
      // await projectResourceProvider.reenumerateResourceInfos();
      projectResourceProvider.localResourceProviderImpl.clearCache();
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
    origin: IResourceOrigin,
    profName: string,
    projectId: string,
    presetSpec: IPresetSpec,
  ): Promise<IProfileData> {
    const profile = await this.presetProfileLoader.loadPresetProfileData(
      origin,
      projectId,
      presetSpec,
    );
    if (!profile) {
      throw new Error('failed to load profile');
    }
    await this.core.saveProfile(profName, profile);
    return profile;
  }

  private async createProfile(
    profName: string,
    origin: IResourceOrigin,
    projectId: string,
    presetSpec: IPresetSpec,
  ) {
    if (this.status.allProfileNames.includes(profName)) {
      return false;
    }
    const profileData = await this.createProfileImpl(
      origin,
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
  }

  private async deleteProfile(profName: string) {
    if (!this.status.allProfileNames.includes(profName)) {
      return false;
    }
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
  }

  private async renameProfile(profName: string, newProfName: string) {
    if (!this.status.allProfileNames.includes(profName)) {
      return false;
    }
    if (this.status.allProfileNames.includes(newProfName)) {
      return false;
    }
    const isCurrent = this.status.currentProfileName === profName;
    await this.core.renameProfile(profName, newProfName);
    const allProfileNames = await this.core.listAllProfileNames();
    this.setStatus({ allProfileNames });
    if (isCurrent) {
      await this.loadProfile(newProfName);
    }
  }

  private async copyProfile(profName: string, newProfName: string) {
    if (!this.status.allProfileNames.includes(profName)) {
      return false;
    }
    if (this.status.allProfileNames.includes(newProfName)) {
      return false;
    }
    await this.core.copyProfile(profName, newProfName);
    const allProfileNames = await this.core.listAllProfileNames();
    this.setStatus({ allProfileNames });
    await this.loadProfile(newProfName);
  }

  private async executeCommand(cmd: IProfileManagerCommand) {
    // console.log(`execute command`, { cmd });
    if (cmd.creatProfile) {
      await this.createProfile(
        cmd.creatProfile.name,
        cmd.creatProfile.targetProjectOrigin,
        cmd.creatProfile.targetProjectId,
        cmd.creatProfile.presetSpec,
      );
    } else if (cmd.deleteProfile) {
      await this.deleteProfile(cmd.deleteProfile.name);
    } else if (cmd.loadProfile) {
      await this.loadProfile(cmd.loadProfile.name);
    } else if (cmd.renameProfile) {
      await this.renameProfile(
        cmd.renameProfile.name,
        cmd.renameProfile.newName,
      );
    } else if (cmd.copyProfile) {
      await this.copyProfile(cmd.copyProfile.name, cmd.copyProfile.newName);
    } else if (cmd.saveCurrentProfile) {
      await this.saveCurrentProfile(cmd.saveCurrentProfile.profileData);
    } else if (cmd.saveAsProjectPreset) {
      const { projectId, presetName, profileData } = cmd.saveAsProjectPreset;
      await this.saveAsProjectPreset(projectId, presetName, profileData);
    }
  }

  async executeCommands(commands: IProfileManagerCommand[]) {
    for (const cmd of commands) {
      await this.executeCommand(cmd);
    }
  }
}
