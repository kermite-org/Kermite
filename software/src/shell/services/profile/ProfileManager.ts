import { shell } from 'electron';
import {
  IProfileManagerStatus,
  IProfileData,
  duplicateObjectByJsonStringifyParse,
  fallbackProfileData,
  clampValue,
  IProfileManagerCommand,
  IPresetSpec,
  IResourceOrigin,
  IProfileEditSource,
  IPersistKeyboardDesign,
  IProfileEntry,
  IGlobalSettings,
} from '~/shared';
import {
  vObject,
  vSchemaOneOf,
  vString,
  vValueEquals,
} from '~/shared/modules/SchemaValidationHelper';
import { applicationStorage } from '~/shell/base';
import { createEventPort } from '~/shell/funcs';
import { projectResourceProvider } from '~/shell/projectResources';
import { globalSettingsProvider } from '~/shell/services/config/GlobalSettingsProvider';
import { IPresetProfileLoader, IProfileManager } from './Interfaces';
import { ProfileManagerCore } from './ProfileManagerCore';

function createLazyInitializer(
  taskCreator: () => Promise<void>,
): () => Promise<void> {
  let task: Promise<void> | undefined;
  return async () => {
    if (!task) {
      task = taskCreator();
    }
    await task;
  };
}

function createInternalProfileEditSourceOrFallback(
  profileEntry?: IProfileEntry,
): IProfileEditSource {
  if (profileEntry) {
    const { profileName, projectId } = profileEntry;
    return {
      type: 'InternalProfile',
      profileName,
      projectId,
    };
  } else {
    return {
      type: 'NoProfilesAvailable',
    };
  }
}

const profileEditSourceLoadingDataSchema = vSchemaOneOf([
  vObject({
    type: vValueEquals('InternalProfile'),
    profileName: vString(),
  }),
  vObject({
    type: vValueEquals('ExternalFile'),
    filePath: vString(),
  }),
]);

// プロファイルを<UserDataDir>/data/profiles以下でファイルとして管理
export class ProfileManager implements IProfileManager {
  private status: IProfileManagerStatus = {
    editSource: {
      type: 'ProfileNewlyCreated',
    },
    loadedProfileData: fallbackProfileData,
    allProfileEntries: [],
    visibleProfileEntries: [],
  };

  private core: ProfileManagerCore;

  constructor(private presetProfileLoader: IPresetProfileLoader) {
    this.core = new ProfileManagerCore();
  }

  statusEventPort = createEventPort<Partial<IProfileManagerStatus>>({
    onFirstSubscriptionStarting: () => {
      this.lazyInitializer();
      this.startLifecycle();
    },
    onLastSubscriptionEnded: () => this.endLifecycle(),
    initialValueGetter: () => this.status,
  });

  private startLifecycle() {
    globalSettingsProvider.globalConfigEventPort.subscribe(
      this.onGlobalSettingsChange,
    );
  }

  private endLifecycle() {
    globalSettingsProvider.globalConfigEventPort.unsubscribe(
      this.onGlobalSettingsChange,
    );
  }

  private onGlobalSettingsChange = (settings: Partial<IGlobalSettings>) => {
    if (settings.globalProjectId !== undefined) {
      this.patchStatusOnGlobalProjectIdChange();
    }
  };

  private async patchStatusOnGlobalProjectIdChange() {
    await this.reEnumerateAllProfileEntries();
    const currEditSource = this.status.editSource;
    const modEditSource = this.fixEditSource(currEditSource);
    if (modEditSource !== currEditSource) {
      const profile = await this.loadProfileByEditSource(modEditSource);
      this.setStatus({
        editSource: modEditSource,
        loadedProfileData: profile,
      });
    }
  }

  private async reEnumerateAllProfileEntries() {
    const allProfileEntries = await this.core.listAllProfileEntries();
    const visibleProfileEntries = this.getVisibleProfiles(allProfileEntries);
    this.setStatus({ allProfileEntries, visibleProfileEntries });
  }

  private lazyInitializer = createLazyInitializer(async () => {
    await this.core.ensureProfilesDirectoryExists();
    await this.reEnumerateAllProfileEntries();
    const loadedEditSource = this.loadInitialEditSource();
    const editSource = this.fixEditSource(loadedEditSource);
    const profile = await this.loadProfileByEditSource(editSource);
    this.setStatus({
      editSource,
      loadedProfileData: profile,
    });
  });

  getCurrentProfileProjectId(): string {
    return this.status.loadedProfileData?.projectId;
  }

  async getAllProfileEntriesAsync(): Promise<IProfileEntry[]> {
    await this.lazyInitializer();
    return this.status.allProfileEntries;
  }

  async getCurrentProfileAsync(): Promise<IProfileData | undefined> {
    await this.lazyInitializer();
    if (this.status.editSource.type === 'NoProfilesAvailable') {
      return undefined;
    }
    return this.status.loadedProfileData;
  }

  private loadInitialEditSource(): IProfileEditSource {
    if (this.status.visibleProfileEntries.length === 0) {
      return { type: 'NoProfilesAvailable' };
    }
    return applicationStorage.readItemSafe<IProfileEditSource>(
      'profileEditSource',
      profileEditSourceLoadingDataSchema,
      { type: 'ProfileNewlyCreated' },
    );
  }

  private getVisibleProfiles(allProfiles: IProfileEntry[]): IProfileEntry[] {
    const { globalProjectId } = globalSettingsProvider.getGlobalSettings();
    if (globalProjectId) {
      return allProfiles.filter((it) => it.projectId === globalProjectId);
    } else {
      return allProfiles;
    }
  }

  private fixEditSource(editSource: IProfileEditSource): IProfileEditSource {
    const { globalProjectId } = globalSettingsProvider.getGlobalSettings();
    if (globalProjectId) {
      if (
        editSource.type === 'InternalProfile' &&
        editSource.projectId !== globalProjectId
      ) {
        return createInternalProfileEditSourceOrFallback(
          this.status.visibleProfileEntries[0],
        );
      }
    }
    if (editSource.type === 'NoProfilesAvailable') {
      return createInternalProfileEditSourceOrFallback(
        this.status.visibleProfileEntries[0],
      );
    }
    return editSource;
  }

  private setStatus(newStatePartial: Partial<IProfileManagerStatus>) {
    this.status = { ...this.status, ...newStatePartial };
    this.statusEventPort.emit(newStatePartial);
    if (newStatePartial.editSource) {
      if (
        newStatePartial.editSource.type !== 'ProfileNewlyCreated' &&
        newStatePartial.editSource.type !== 'NoProfilesAvailable'
      ) {
        applicationStorage.writeItem(
          'profileEditSource',
          newStatePartial.editSource,
        );
      }
    }
  }

  async loadProfileByEditSource(
    editSource: IProfileEditSource,
  ): Promise<IProfileData> {
    if (editSource.type === 'NoProfilesAvailable') {
      return fallbackProfileData;
    } else if (editSource.type === 'ProfileNewlyCreated') {
      return fallbackProfileData;
    } else if (editSource.type === 'InternalProfile') {
      return await this.core.loadProfile(editSource.profileName);
    } else if (editSource.type === 'ExternalFile') {
      return await this.core.loadExternalProfileFile(editSource.filePath);
    }
    return fallbackProfileData;
  }

  async loadProfile(profName: string) {
    const profileData = await this.core.loadProfile(profName);
    this.setStatus({
      editSource: {
        type: 'InternalProfile',
        profileName: profName,
        projectId: profileData.projectId,
      },
      loadedProfileData: profileData,
    });
  }

  private unloadProfile() {
    this.setStatus({
      editSource: { type: 'NoProfilesAvailable' },
      loadedProfileData: fallbackProfileData,
    });
  }

  async saveCurrentProfile(profileData: IProfileData) {
    const { editSource } = this.status;
    if (editSource.type === 'NoProfilesAvailable') {
    } else if (editSource.type === 'ProfileNewlyCreated') {
    } else if (editSource.type === 'ExternalFile') {
      await this.core.saveExternalProfileFile(editSource.filePath, profileData);
    } else if (editSource.type === 'InternalProfile') {
      await this.core.saveProfile(editSource.profileName, profileData);
    }
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
      projectResourceProvider.localResourceProviderImpl.clearCache();
      this.presetProfileLoader.deleteProjectPresetProfileCache(projectId);
    }
  }

  private async createProfileImpl(
    origin: IResourceOrigin,
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
    return profile;
  }

  private hasProfileWithName(profileName: string): boolean {
    return this.status.allProfileEntries.some(
      (it) => it.profileName === profileName,
    );
  }

  private async createProfile(
    profileName: string,
    origin: IResourceOrigin,
    projectId: string,
    presetSpec: IPresetSpec,
  ) {
    if (this.hasProfileWithName(profileName)) {
      return false;
    }
    const profileData = await this.createProfileImpl(
      origin,
      projectId,
      presetSpec,
    );
    await this.core.saveProfile(profileName, profileData);
    await this.reEnumerateAllProfileEntries();
    this.setStatus({
      editSource: {
        type: 'InternalProfile',
        profileName,
        projectId,
      },
      loadedProfileData: profileData,
    });
  }

  private async createProfileUnnamed(
    origin: IResourceOrigin,
    projectId: string,
    presetSpec: IPresetSpec,
  ) {
    const profileData = await this.createProfileImpl(
      origin,
      projectId,
      presetSpec,
    );
    this.setStatus({
      editSource: { type: 'ProfileNewlyCreated' },
      loadedProfileData: profileData,
    });
  }

  private createProfileExternal(profileData: IProfileData) {
    this.setStatus({
      editSource: { type: 'ProfileNewlyCreated' },
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
      editSource: { type: 'ProfileNewlyCreated' },
      loadedProfileData: profileData,
    });
  }

  private async deleteProfile(profName: string) {
    if (this.status.editSource.type !== 'InternalProfile') {
      return;
    }
    if (!this.hasProfileWithName(profName)) {
      return false;
    }
    const isCurrent = this.status.editSource.profileName === profName;
    const currentProfileIndex = this.status.visibleProfileEntries.findIndex(
      (it) => it.profileName === profName,
    );
    await this.core.deleteProfile(profName);
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
      const nextProfileName = this.status.visibleProfileEntries[newIndex]
        ?.profileName;
      if (nextProfileName) {
        await this.loadProfile(nextProfileName);
      }
    }
  }

  private async renameProfile(profName: string, newProfName: string) {
    if (this.status.editSource.type !== 'InternalProfile') {
      return;
    }
    if (!this.hasProfileWithName(profName)) {
      return false;
    }
    if (this.hasProfileWithName(newProfName)) {
      return false;
    }
    const isCurrent = this.status.editSource.profileName === profName;
    await this.core.renameProfile(profName, newProfName);
    await this.reEnumerateAllProfileEntries();
    if (isCurrent) {
      await this.loadProfile(newProfName);
    }
  }

  private async copyProfile(profName: string, newProfName: string) {
    if (!this.hasProfileWithName(profName)) {
      return false;
    }
    if (this.hasProfileWithName(newProfName)) {
      return false;
    }
    await this.core.copyProfile(profName, newProfName);
    await this.reEnumerateAllProfileEntries();
    await this.loadProfile(newProfName);
  }

  private async saveProfileAs(newProfName: string, profileData: IProfileData) {
    if (this.hasProfileWithName(newProfName)) {
      return false;
    }
    await this.core.saveProfile(newProfName, profileData);
    await this.reEnumerateAllProfileEntries();
    await this.loadProfile(newProfName);
  }

  private async importFromFile(filePath: string) {
    const editSource: IProfileEditSource = {
      type: 'ExternalFile',
      filePath: filePath,
    };
    const profile = await this.loadProfileByEditSource(editSource);
    this.setStatus({
      editSource,
      loadedProfileData: profile,
    });
  }

  private async exportToFile(filePath: string, profileData: IProfileData) {
    await this.core.saveExternalProfileFile(filePath, profileData);
  }

  private async executeCommand(cmd: IProfileManagerCommand) {
    // console.log(`execute command`, { cmd });
    if (cmd.creatProfile) {
      if (cmd.creatProfile.name) {
        await this.createProfile(
          cmd.creatProfile.name,
          cmd.creatProfile.targetProjectOrigin,
          cmd.creatProfile.targetProjectId,
          cmd.creatProfile.presetSpec,
        );
      } else {
        await this.createProfileUnnamed(
          cmd.creatProfile.targetProjectOrigin,
          cmd.creatProfile.targetProjectId,
          cmd.creatProfile.presetSpec,
        );
      }
    } else if (cmd.createProfileExternal) {
      this.createProfileExternal(cmd.createProfileExternal.profileData);
    } else if (cmd.createProfileFromLayout) {
      this.createProfileFromLayout(
        cmd.createProfileFromLayout.projectId,
        cmd.createProfileFromLayout.layout,
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
    } else if (cmd.importFromFile) {
      await this.importFromFile(cmd.importFromFile.filePath);
    } else if (cmd.exportToFile) {
      await this.exportToFile(
        cmd.exportToFile.filePath,
        cmd.exportToFile.profileData,
      );
    } else if (cmd.saveProfileAs) {
      await this.saveProfileAs(
        cmd.saveProfileAs.name,
        cmd.saveProfileAs.profileData,
      );
    }
  }

  async executeCommands(commands: IProfileManagerCommand[]) {
    for (const cmd of commands) {
      await this.executeCommand(cmd);
    }
  }

  async openUserProfilesFolder() {
    await shell.openPath(this.core.getProfilesFolderPath());
  }
}
