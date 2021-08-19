import { shell } from 'electron';
import produce from 'immer';
import {
  checkProfileEntryEquality,
  clampValue,
  duplicateObjectByJsonStringifyParse,
  fallbackProfileData,
  ICoreState,
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

function getVisibleProfiles(allProfiles: IProfileEntry[]): IProfileEntry[] {
  const { globalProjectId } = coreState.globalSettings;
  if (globalProjectId) {
    return allProfiles.filter((it) => it.projectId === globalProjectId);
  } else {
    return allProfiles;
  }
}

function hasProfileEntry(profileEntry: IProfileEntry): boolean {
  return coreState.allProfileEntries.some((it) =>
    checkProfileEntryEquality(it, profileEntry),
  );
}

async function reEnumerateAllProfileEntries() {
  const allProfileEntries = await profileManager.core.listAllProfileEntries();
  const visibleProfileEntries = getVisibleProfiles(allProfileEntries);
  return { allProfileEntries, visibleProfileEntries };
}

// プロファイルを<UserDataDir>/data/profiles以下でファイルとして管理
export class ProfileManager implements IProfileManager {
  core: ProfileManagerCore;
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
    const visibleProfileEntries = getVisibleProfiles(allProfileEntries);
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

  async loadProfileByEditSource(
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

  createProfileImpl(
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

  // eslint-disable-next-line @typescript-eslint/require-await
  async executeCommands(_commands: IProfileManagerCommand[]) {
    throw new Error('invoked method obsoleted');
  }
}

export const profileManager = new ProfileManager();

export const profileManagerModule = createCoreModule({
  async profile_createProfile({
    newProfileName: profileName,
    targetProjectOrigin: origin,
    targetProjectId: projectId,
    presetSpec,
  }) {
    const profileEntry = { projectId, profileName };
    if (hasProfileEntry(profileEntry)) {
      return;
    }
    const profileData = profileManager.createProfileImpl(
      origin,
      projectId,
      presetSpec,
    );
    await profileManager.core.saveProfile(profileEntry, profileData);
    const {
      allProfileEntries,
      visibleProfileEntries,
    } = await reEnumerateAllProfileEntries();
    commitCoreState({
      allProfileEntries,
      visibleProfileEntries,
      profileEditSource: {
        type: 'InternalProfile',
        profileEntry,
      },
      loadedProfileData: profileData,
    });
  },
  profile_createProfileUnnamed({
    targetProjectOrigin: origin,
    targetProjectId: projectId,
    presetSpec,
  }) {
    const profileData = profileManager.createProfileImpl(
      origin,
      projectId,
      presetSpec,
    );
    commitCoreState({
      profileEditSource: { type: 'ProfileNewlyCreated' },
      loadedProfileData: profileData,
    });
  },
  profile_createProfileExternal({ profileData }) {
    commitCoreState({
      profileEditSource: { type: 'ProfileNewlyCreated' },
      loadedProfileData: profileData,
    });
  },
  profile_createProfileFromLayout({ projectId, layout }) {
    const profileData = duplicateObjectByJsonStringifyParse(
      fallbackProfileData,
    );
    profileData.projectId = projectId;
    profileData.keyboardDesign = layout;
    commitCoreState({
      profileEditSource: { type: 'ProfileNewlyCreated' },
      loadedProfileData: profileData,
    });
  },

  async profile_loadProfile({ profileEntry }) {
    const profileData = await profileManager.core.loadProfile(profileEntry);
    commitCoreState({
      profileEditSource: {
        type: 'InternalProfile',
        profileEntry,
      },
      loadedProfileData: profileData,
    });
  },

  async profile_renameProfile({ profileEntry, newProfileName }) {
    if (coreState.profileEditSource.type !== 'InternalProfile') {
      return;
    }
    const newProfileEntry = { ...profileEntry, profileName: newProfileName };
    if (!(hasProfileEntry(profileEntry) && !hasProfileEntry(newProfileEntry))) {
      return;
    }
    const isCurrent = checkProfileEntryEquality(
      coreState.profileEditSource.profileEntry,
      profileEntry,
    );
    await profileManager.core.renameProfile(profileEntry, newProfileEntry);
    const {
      allProfileEntries,
      visibleProfileEntries,
    } = await reEnumerateAllProfileEntries();
    if (isCurrent) {
      const profileData = await profileManager.core.loadProfile(profileEntry);
      commitCoreState({
        allProfileEntries,
        visibleProfileEntries,
        profileEditSource: {
          type: 'InternalProfile',
          profileEntry,
        },
        loadedProfileData: profileData,
      });
    } else {
      commitCoreState({
        allProfileEntries,
        visibleProfileEntries,
      });
    }
  },

  async profile_copyProfile({ profileEntry, newProfileName }) {
    const newProfileEntry = { ...profileEntry, profileName: newProfileName };
    if (!(hasProfileEntry(profileEntry) && !hasProfileEntry(newProfileEntry))) {
      return;
    }
    await profileManager.core.copyProfile(profileEntry, newProfileEntry);
    const {
      allProfileEntries,
      visibleProfileEntries,
    } = await reEnumerateAllProfileEntries();
    const profileData = await profileManager.core.loadProfile(newProfileEntry);
    commitCoreState({
      allProfileEntries,
      visibleProfileEntries,
      profileEditSource: {
        type: 'InternalProfile',
        profileEntry,
      },
      loadedProfileData: profileData,
    });
  },

  async profile_deleteProfile({ profileEntry }) {
    if (
      !(
        coreState.profileEditSource.type === 'InternalProfile' &&
        hasProfileEntry(profileEntry)
      )
    ) {
      return;
    }
    const isCurrent = checkProfileEntryEquality(
      coreState.profileEditSource.profileEntry,
      profileEntry,
    );
    const currentProfileIndex = coreState.visibleProfileEntries.findIndex(
      (it) => checkProfileEntryEquality(it, profileEntry),
    );
    await profileManager.core.deleteProfile(profileEntry);

    const {
      allProfileEntries,
      visibleProfileEntries,
    } = await reEnumerateAllProfileEntries();

    if (visibleProfileEntries.length === 0) {
      commitCoreState({
        allProfileEntries,
        visibleProfileEntries,
        profileEditSource: { type: 'NoEditProfileAvailable' },
        loadedProfileData: fallbackProfileData,
      });
    } else if (isCurrent) {
      const newIndex = clampValue(
        currentProfileIndex,
        0,
        visibleProfileEntries.length - 1,
      );
      const newProfileEntry = visibleProfileEntries[newIndex];
      if (newProfileEntry) {
        const profileData = await profileManager.core.loadProfile(
          newProfileEntry,
        );
        commitCoreState({
          allProfileEntries,
          visibleProfileEntries,
          profileEditSource: {
            type: 'InternalProfile',
            profileEntry,
          },
          loadedProfileData: profileData,
        });
      }
    } else {
      commitCoreState({
        allProfileEntries,
        visibleProfileEntries,
      });
    }
  },
  async profile_saveCurrentProfile({ profileData }) {
    const { profileEditSource: editSource } = coreState;
    if (editSource.type === 'NoEditProfileAvailable') {
    } else if (editSource.type === 'ProfileNewlyCreated') {
    } else if (editSource.type === 'ExternalFile') {
      await profileManager.core.saveExternalProfileFile(
        editSource.filePath,
        profileData,
      );
    } else if (editSource.type === 'InternalProfile') {
      await profileManager.core.saveProfile(
        editSource.profileEntry,
        profileData,
      );
    }
    commitCoreState({
      loadedProfileData: profileData,
    });
  },

  async profile_saveProfileAs({ profileData, newProfileName }) {
    const newProfileEntry = {
      projectId: profileData.projectId,
      profileName: newProfileName,
    };
    if (hasProfileEntry(newProfileEntry)) {
      return;
    }
    await profileManager.core.saveProfile(newProfileEntry, profileData);
    const {
      allProfileEntries,
      visibleProfileEntries,
    } = await reEnumerateAllProfileEntries();
    const newProfileData = await profileManager.core.loadProfile(
      newProfileEntry,
    );
    commitCoreState({
      allProfileEntries,
      visibleProfileEntries,
      profileEditSource: {
        type: 'InternalProfile',
        profileEntry: newProfileEntry,
      },
      loadedProfileData: newProfileData,
    });
  },
  profile_setEditProfileData({ editProfileData }) {
    commitCoreState({ editProfileData });
  },

  profile_saveAsProjectPreset({ projectId, presetName, profileData }) {
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
  },

  async profile_importFromFile({ filePath }) {
    const editSource: IProfileEditSource = {
      type: 'ExternalFile',
      filePath: filePath,
    };
    const profile = await profileManager.loadProfileByEditSource(editSource);
    commitCoreState({
      profileEditSource: editSource,
      loadedProfileData: profile,
    });
  },

  async profile_exportToFile({ filePath, profileData }) {
    await profileManager.core.saveExternalProfileFile(filePath, profileData);
  },

  async profile_openUserProfilesFolder() {
    const { profileEditSource: editSource } = coreState;
    if (editSource.type === 'InternalProfile' && editSource.profileEntry) {
      await shell.openPath(
        profileManager.core.getProfilesFolderPath(editSource.profileEntry),
      );
    }
  },
});
