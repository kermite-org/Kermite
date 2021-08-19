import { shell } from 'electron';
import produce from 'immer';
import {
  checkProfileEntryEquality,
  clampValue,
  duplicateObjectByJsonStringifyParse,
  fallbackProfileData,
  ICoreState,
  IPersistKeyboardDesign,
  IPresetSpec,
  IProfileData,
  IProfileEditSource,
  IProfileEntry,
  IProfileManagerCommand,
  IResourceOrigin,
} from '~/shared';
import { ProfileDataConverter } from '~/shared/modules/ProfileDataConverter';
import {
  vObject,
  vSchemaOneOf,
  vString,
  vValueEquals,
} from '~/shared/modules/SchemaValidationHelper';
import { applicationStorage } from '~/shell/base';
import {
  commitCoreState,
  coreState,
  coreStateManager,
  createCoreModule,
  dispatchCoreAction,
} from '~/shell/global';
import { presetProfileLoader_loadPresetProfileData } from '~/shell/services/profile/PresetProfileLoader';
import { IProfileManager } from './Interfaces';
import { ProfileManagerCore } from './ProfileManagerCore';

function createInternalProfileEditSourceOrFallback(
  profileEntry?: IProfileEntry,
): IProfileEditSource {
  if (profileEntry) {
    return {
      type: 'InternalProfile',
      profileEntry,
    };
  } else {
    return {
      type: 'NoEditProfileAvailable',
    };
  }
}

const profileEditSourceLoadingDataSchema = vSchemaOneOf([
  vObject({
    type: vValueEquals('InternalProfile'),
    profileEntry: vObject({
      projectId: vString(),
      profileName: vString(),
    }),
  }),
  vObject({
    type: vValueEquals('ExternalFile'),
    filePath: vString(),
  }),
]);

type IProfileManagerStatus = Pick<
  ICoreState,
  | 'allProfileEntries'
  | 'visibleProfileEntries'
  | 'profileEditSource'
  | 'loadedProfileData'
>;

// プロファイルを<UserDataDir>/data/profiles以下でファイルとして管理
export class ProfileManager implements IProfileManager {
  private core: ProfileManagerCore;
  private _globalProjectId: string = '';

  constructor() {
    this.core = new ProfileManagerCore();
  }

  private get status(): IProfileManagerStatus {
    return coreState;
  }

  private setStatus(newStatePartial: Partial<IProfileManagerStatus>) {
    commitCoreState(newStatePartial);

    if (newStatePartial.profileEditSource) {
      if (
        newStatePartial.profileEditSource.type !== 'ProfileNewlyCreated' &&
        newStatePartial.profileEditSource.type !== 'NoEditProfileAvailable'
      ) {
        applicationStorage.writeItem(
          'profileEditSource',
          newStatePartial.profileEditSource,
        );
      }
    }
  }

  async initializeAsync() {
    this._globalProjectId = coreState.globalSettings.globalProjectId;
    await this.core.ensureProfilesDirectoryExists();
    await this.reEnumerateAllProfileEntries();
    const loadedEditSource = this.loadInitialEditSource();
    const editSource = this.fixEditSource(loadedEditSource);
    const profile = await this.loadProfileByEditSource(editSource);
    this.setStatus({
      profileEditSource: editSource,
      loadedProfileData: profile,
    });
    coreStateManager.coreStateEventPort.subscribe(this.onCoreStateChange);
  }

  terminate() {
    coreStateManager.coreStateEventPort.unsubscribe(this.onCoreStateChange);
  }

  private onCoreStateChange = () => {
    const { globalProjectId } = coreState.globalSettings;
    if (globalProjectId !== this._globalProjectId) {
      this.patchStatusOnGlobalProjectIdChange();
      this._globalProjectId = globalProjectId;
    }
  };

  private async patchStatusOnGlobalProjectIdChange() {
    await this.reEnumerateAllProfileEntries();
    const currEditSource = this.status.profileEditSource;
    const modEditSource = this.fixEditSource(currEditSource);
    if (modEditSource !== currEditSource) {
      const profile = await this.loadProfileByEditSource(modEditSource);
      this.setStatus({
        profileEditSource: modEditSource,
        loadedProfileData: profile,
      });
    }
  }

  private async reEnumerateAllProfileEntries() {
    const allProfileEntries = await this.core.listAllProfileEntries();
    const visibleProfileEntries = this.getVisibleProfiles(allProfileEntries);
    this.setStatus({ allProfileEntries, visibleProfileEntries });
  }

  getCurrentProfileProjectId(): string {
    return this.status.loadedProfileData?.projectId;
  }

  getCurrentProfile(): IProfileData | undefined {
    if (this.status.profileEditSource.type === 'NoEditProfileAvailable') {
      return undefined;
    }
    return this.status.loadedProfileData;
  }

  private loadInitialEditSource(): IProfileEditSource {
    if (this.status.visibleProfileEntries.length === 0) {
      return { type: 'NoEditProfileAvailable' };
    }
    return applicationStorage.readItemSafe<IProfileEditSource>(
      'profileEditSource',
      profileEditSourceLoadingDataSchema,
      { type: 'ProfileNewlyCreated' },
    );
  }

  private getVisibleProfiles(allProfiles: IProfileEntry[]): IProfileEntry[] {
    const { globalProjectId } = coreState.globalSettings;
    if (globalProjectId) {
      return allProfiles.filter((it) => it.projectId === globalProjectId);
    } else {
      return allProfiles;
    }
  }

  private fixEditSource(editSource: IProfileEditSource): IProfileEditSource {
    const { globalProjectId } = coreState.globalSettings;
    if (globalProjectId) {
      if (
        editSource.type === 'InternalProfile' &&
        editSource.profileEntry.projectId !== globalProjectId
      ) {
        return createInternalProfileEditSourceOrFallback(
          this.status.visibleProfileEntries[0],
        );
      }
    }
    if (editSource.type === 'NoEditProfileAvailable') {
      return createInternalProfileEditSourceOrFallback(
        this.status.visibleProfileEntries[0],
      );
    }
    return editSource;
  }

  private async loadProfileByEditSource(
    editSource: IProfileEditSource,
  ): Promise<IProfileData> {
    if (editSource.type === 'NoEditProfileAvailable') {
      return fallbackProfileData;
    } else if (editSource.type === 'ProfileNewlyCreated') {
      return fallbackProfileData;
    } else if (editSource.type === 'InternalProfile') {
      return await this.core.loadProfile(editSource.profileEntry);
    } else if (editSource.type === 'ExternalFile') {
      return await this.core.loadExternalProfileFile(editSource.filePath);
    }
    return fallbackProfileData;
  }

  private async loadProfile(profileEntry: IProfileEntry) {
    const profileData = await this.core.loadProfile(profileEntry);
    this.setStatus({
      profileEditSource: {
        type: 'InternalProfile',
        profileEntry,
      },
      loadedProfileData: profileData,
    });
  }

  private unloadProfile() {
    this.setStatus({
      profileEditSource: { type: 'NoEditProfileAvailable' },
      loadedProfileData: fallbackProfileData,
    });
  }

  async saveCurrentProfile(profileData: IProfileData) {
    const { profileEditSource: editSource } = this.status;
    if (editSource.type === 'NoEditProfileAvailable') {
    } else if (editSource.type === 'ProfileNewlyCreated') {
    } else if (editSource.type === 'ExternalFile') {
      await this.core.saveExternalProfileFile(editSource.filePath, profileData);
    } else if (editSource.type === 'InternalProfile') {
      await this.core.saveProfile(editSource.profileEntry, profileData);
    }
    this.setStatus({
      loadedProfileData: profileData,
    });
  }

  private saveAsProjectPreset(
    projectId: string,
    presetName: string,
    profileData: IProfileData,
  ) {
    const projectInfos = coreState.allProjectPackageInfos;
    const projectInfo = projectInfos.find(
      (info) => info.origin === 'local' && info.projectId === projectId,
    );
    if (projectInfo) {
      const preset = ProfileDataConverter.convertProfileDataToPersist(
        profileData,
      );
      const newProjectInfo = produce(projectInfo, (draft) => {
        const profile = draft.presets.find(
          (it) => it.presetName === presetName,
        );
        if (profile) {
          profile.data = preset;
        } else {
          draft.presets.push({ presetName: presetName, data: preset });
        }
      });
      dispatchCoreAction({
        project_saveLocalProjectPackageInfo: newProjectInfo,
      });
    }
  }

  private createProfileImpl(
    origin: IResourceOrigin,
    projectId: string,
    presetSpec: IPresetSpec,
  ): IProfileData {
    const profile = presetProfileLoader_loadPresetProfileData(
      origin,
      projectId,
      presetSpec,
    );
    if (!profile) {
      throw new Error('failed to load profile');
    }
    return profile;
  }

  private hasProfileEntry(profileEntry: IProfileEntry): boolean {
    return this.status.allProfileEntries.some((it) =>
      checkProfileEntryEquality(it, profileEntry),
    );
  }

  private async createProfile(
    profileName: string,
    origin: IResourceOrigin,
    projectId: string,
    presetSpec: IPresetSpec,
  ) {
    const profileEntry = { projectId, profileName };
    if (this.hasProfileEntry(profileEntry)) {
      return false;
    }
    const profileData = this.createProfileImpl(origin, projectId, presetSpec);
    await this.core.saveProfile(profileEntry, profileData);
    await this.reEnumerateAllProfileEntries();
    this.setStatus({
      profileEditSource: {
        type: 'InternalProfile',
        profileEntry,
      },
      loadedProfileData: profileData,
    });
  }

  private createProfileUnnamed(
    origin: IResourceOrigin,
    projectId: string,
    presetSpec: IPresetSpec,
  ) {
    const profileData = this.createProfileImpl(origin, projectId, presetSpec);
    this.setStatus({
      profileEditSource: { type: 'ProfileNewlyCreated' },
      loadedProfileData: profileData,
    });
  }

  private createProfileExternal(profileData: IProfileData) {
    this.setStatus({
      profileEditSource: { type: 'ProfileNewlyCreated' },
      loadedProfileData: profileData,
    });
  }

  private createProfileFromLayout(
    projectId: string,
    layout: IPersistKeyboardDesign,
  ) {
    const profileData: IProfileData = duplicateObjectByJsonStringifyParse(
      fallbackProfileData,
    );
    profileData.projectId = projectId;
    profileData.keyboardDesign = layout;
    this.setStatus({
      profileEditSource: { type: 'ProfileNewlyCreated' },
      loadedProfileData: profileData,
    });
  }

  private async deleteProfile(profileEntry: IProfileEntry) {
    if (this.status.profileEditSource.type !== 'InternalProfile') {
      return;
    }
    if (!this.hasProfileEntry(profileEntry)) {
      return false;
    }
    const isCurrent = checkProfileEntryEquality(
      this.status.profileEditSource.profileEntry,
      profileEntry,
    );
    const currentProfileIndex = this.status.visibleProfileEntries.findIndex(
      (it) => checkProfileEntryEquality(it, profileEntry),
    );
    await this.core.deleteProfile(profileEntry);
    await this.reEnumerateAllProfileEntries();
    if (this.status.visibleProfileEntries.length === 0) {
      this.unloadProfile();
    }
    if (isCurrent) {
      const newIndex = clampValue(
        currentProfileIndex,
        0,
        this.status.visibleProfileEntries.length - 1,
      );
      const newProfileEntry = this.status.visibleProfileEntries[newIndex];
      if (newProfileEntry) {
        await this.loadProfile(newProfileEntry);
      }
    }
  }

  private async renameProfile(
    profileEntry: IProfileEntry,
    newProfileName: string,
  ) {
    const newProfileEntry = { ...profileEntry, profileName: newProfileName };
    if (this.status.profileEditSource.type !== 'InternalProfile') {
      return;
    }
    if (!this.hasProfileEntry(profileEntry)) {
      return false;
    }
    if (this.hasProfileEntry(newProfileEntry)) {
      return false;
    }
    const isCurrent = checkProfileEntryEquality(
      this.status.profileEditSource.profileEntry,
      profileEntry,
    );
    await this.core.renameProfile(profileEntry, newProfileEntry);
    await this.reEnumerateAllProfileEntries();
    if (isCurrent) {
      await this.loadProfile(newProfileEntry);
    }
  }

  private async copyProfile(
    profileEntry: IProfileEntry,
    newProfileName: string,
  ) {
    const newProfileEntry = { ...profileEntry, profileName: newProfileName };
    if (!this.hasProfileEntry(profileEntry)) {
      return false;
    }
    if (this.hasProfileEntry(newProfileEntry)) {
      return false;
    }
    await this.core.copyProfile(profileEntry, newProfileEntry);
    await this.reEnumerateAllProfileEntries();
    await this.loadProfile(newProfileEntry);
  }

  private async saveProfileAs(
    profileData: IProfileData,
    newProfileName: string,
  ) {
    const newProfileEntry = {
      projectId: profileData.projectId,
      profileName: newProfileName,
    };
    if (this.hasProfileEntry(newProfileEntry)) {
      return false;
    }
    await this.core.saveProfile(newProfileEntry, profileData);
    await this.reEnumerateAllProfileEntries();
    await this.loadProfile(newProfileEntry);
  }

  private async importFromFile(filePath: string) {
    const editSource: IProfileEditSource = {
      type: 'ExternalFile',
      filePath: filePath,
    };
    const profile = await this.loadProfileByEditSource(editSource);
    this.setStatus({
      profileEditSource: editSource,
      loadedProfileData: profile,
    });
  }

  private async exportToFile(filePath: string, profileData: IProfileData) {
    await this.core.saveExternalProfileFile(filePath, profileData);
  }

  private async openUserProfilesFolder() {
    const { profileEditSource: editSource } = this.status;
    if (editSource.type === 'InternalProfile' && editSource.profileEntry) {
      await shell.openPath(
        this.core.getProfilesFolderPath(editSource.profileEntry),
      );
    }
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
    } else if (cmd.creatProfileUnnamed) {
      this.createProfileUnnamed(
        cmd.creatProfileUnnamed.targetProjectOrigin,
        cmd.creatProfileUnnamed.targetProjectId,
        cmd.creatProfileUnnamed.presetSpec,
      );
    } else if (cmd.createProfileExternal) {
      this.createProfileExternal(cmd.createProfileExternal.profileData);
    } else if (cmd.createProfileFromLayout) {
      this.createProfileFromLayout(
        cmd.createProfileFromLayout.projectId,
        cmd.createProfileFromLayout.layout,
      );
    } else if (cmd.deleteProfile) {
      await this.deleteProfile(cmd.deleteProfile.profileEntry);
    } else if (cmd.loadProfile) {
      await this.loadProfile(cmd.loadProfile.profileEntry);
    } else if (cmd.renameProfile) {
      await this.renameProfile(
        cmd.renameProfile.profileEntry,
        cmd.renameProfile.newProfileName,
      );
    } else if (cmd.copyProfile) {
      await this.copyProfile(
        cmd.copyProfile.profileEntry,
        cmd.copyProfile.newProfileName,
      );
    } else if (cmd.saveCurrentProfile) {
      await this.saveCurrentProfile(cmd.saveCurrentProfile.profileData);
    } else if (cmd.saveAsProjectPreset) {
      const { projectId, presetName, profileData } = cmd.saveAsProjectPreset;
      this.saveAsProjectPreset(projectId, presetName, profileData);
    } else if (cmd.importFromFile) {
      await this.importFromFile(cmd.importFromFile.filePath);
    } else if (cmd.exportToFile) {
      await this.exportToFile(
        cmd.exportToFile.filePath,
        cmd.exportToFile.profileData,
      );
    } else if (cmd.saveProfileAs) {
      await this.saveProfileAs(
        cmd.saveProfileAs.profileData,
        cmd.saveProfileAs.newProfileName,
      );
    } else if (cmd.openUserProfilesFolder) {
      await this.openUserProfilesFolder();
    }
  }

  async executeCommands(commands: IProfileManagerCommand[]) {
    for (const cmd of commands) {
      await this.executeCommand(cmd);
    }
  }
}

export const profileManager = new ProfileManager();

export const profileManagerModule = createCoreModule({
  profile_setEditProfileData({ editProfileData }) {
    commitCoreState({ editProfileData });
  },
});
