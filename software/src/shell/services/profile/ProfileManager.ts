import { shell } from 'electron';
import produce from 'immer';
import {
  checkProfileEntryEquality,
  duplicateObjectByJsonStringifyParse,
  fallbackProfileData,
  ICoreState,
  IPresetSpec,
  IProfileData,
  IProfileEditSource,
  IProfileEntry,
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
import { profileManagerCore } from '~/shell/services/profile/ProfileManagerCore';

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

const profilesReader = {
  getVisibleProfiles(allProfiles: IProfileEntry[]): IProfileEntry[] {
    const { globalProjectId } = coreState.globalSettings;
    if (globalProjectId) {
      return allProfiles.filter((it) => it.projectId === globalProjectId);
    } else {
      return allProfiles;
    }
  },
  get visibleProfileEntries() {
    return profilesReader.getVisibleProfiles(coreState.allProfileEntries);
  },
  hasProfileEntry(profileEntry: IProfileEntry): boolean {
    return coreState.allProfileEntries.some((it) =>
      checkProfileEntryEquality(it, profileEntry),
    );
  },
  get currentProfileEntry(): IProfileEntry {
    if (coreState.profileEditSource.type === 'InternalProfile') {
      return coreState.profileEditSource.profileEntry;
    }
    throw new Error(errorTextInvalidOperation);
  },
};

function createProfileImpl(
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

function loadInitialEditSource(): IProfileEditSource {
  if (profilesReader.visibleProfileEntries.length === 0) {
    return { type: 'NoEditProfileAvailable' };
  }
  return applicationStorage.readItemSafe<IProfileEditSource>(
    'profileEditSource',
    profileEditSourceLoadingDataSchema,
    { type: 'ProfileNewlyCreated' },
  );
}

function saveEditSource(profileEditSource: IProfileEditSource) {
  if (
    profileEditSource.type !== 'ProfileNewlyCreated' &&
    profileEditSource.type !== 'NoEditProfileAvailable'
  ) {
    applicationStorage.writeItem('profileEditSource', profileEditSource);
  }
}

function fixEditSource(editSource: IProfileEditSource): IProfileEditSource {
  const { globalProjectId } = coreState.globalSettings;
  const { visibleProfileEntries } = profilesReader;
  if (globalProjectId) {
    if (
      editSource.type === 'InternalProfile' &&
      editSource.profileEntry.projectId !== globalProjectId
    ) {
      return createInternalProfileEditSourceOrFallback(
        visibleProfileEntries[0],
      );
    }
  }
  if (editSource.type === 'NoEditProfileAvailable') {
    return createInternalProfileEditSourceOrFallback(visibleProfileEntries[0]);
  }
  return editSource;
}

async function loadProfileByEditSource(
  editSource: IProfileEditSource,
): Promise<IProfileData> {
  if (editSource.type === 'NoEditProfileAvailable') {
    return fallbackProfileData;
  } else if (editSource.type === 'ProfileNewlyCreated') {
    return fallbackProfileData;
  } else if (editSource.type === 'InternalProfile') {
    return await profileManagerCore.loadProfile(editSource.profileEntry);
  } else if (editSource.type === 'ExternalFile') {
    return await profileManagerCore.loadExternalProfileFile(
      editSource.filePath,
    );
  }
  return fallbackProfileData;
}

async function patchStatusOnGlobalProjectIdChange() {
  const currEditSource = coreState.profileEditSource;
  const modEditSource = fixEditSource(currEditSource);
  if (modEditSource !== currEditSource) {
    const profile = await loadProfileByEditSource(modEditSource);
    commitCoreState({
      profileEditSource: modEditSource,
      loadedProfileData: profile,
    });
  }
}

function onCoreStateChange(partialState: Partial<ICoreState>) {
  if (partialState.globalSettings) {
    const {
      globalSettings: { globalProjectId },
    } = partialState;
    if (globalProjectId !== _globalProjectId) {
      patchStatusOnGlobalProjectIdChange();
      _globalProjectId = globalProjectId;
    }
  }
  if (partialState.profileEditSource) {
    const { profileEditSource } = partialState;
    saveEditSource(profileEditSource);
  }
}

let _globalProjectId: string = '';

// プロファイルを<UserDataDir>/data/profiles以下でファイルとして管理
class ProfileManager {
  async initializeAsync() {
    _globalProjectId = coreState.globalSettings.globalProjectId;
    await profileManagerCore.ensureProfilesDirectoryExists();
    const allProfileEntries = await profileManagerCore.listAllProfileEntries();
    const loadedEditSource = loadInitialEditSource();
    const editSource = fixEditSource(loadedEditSource);
    const profile = await loadProfileByEditSource(editSource);
    commitCoreState({
      allProfileEntries,
      profileEditSource: editSource,
      loadedProfileData: profile,
    });
    coreStateManager.coreStateEventPort.subscribe(onCoreStateChange);
  }

  terminate() {
    coreStateManager.coreStateEventPort.unsubscribe(onCoreStateChange);
  }
}

export const profileManager = new ProfileManager();

const errorTextInvalidOperation = 'invalid operation';

export const profileManagerModule = createCoreModule({
  async profile_createProfile({
    newProfileName: profileName,
    targetProjectOrigin: origin,
    targetProjectId: projectId,
    presetSpec,
  }) {
    const profileEntry = { projectId, profileName };
    if (profilesReader.hasProfileEntry(profileEntry)) {
      throw new Error(errorTextInvalidOperation);
    }
    const profileData = createProfileImpl(origin, projectId, presetSpec);
    await profileManagerCore.saveProfile(profileEntry, profileData);
    const allProfileEntries = await profileManagerCore.listAllProfileEntries();
    commitCoreState({
      allProfileEntries,
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
    const profileData = createProfileImpl(origin, projectId, presetSpec);
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
    const profileData = await profileManagerCore.loadProfile(profileEntry);
    commitCoreState({
      profileEditSource: {
        type: 'InternalProfile',
        profileEntry,
      },
      loadedProfileData: profileData,
    });
  },

  async profile_copyProfile({ newProfileName }) {
    const profileEntry = profilesReader.currentProfileEntry;
    const newProfileEntry = { ...profileEntry, profileName: newProfileName };
    if (profilesReader.hasProfileEntry(newProfileEntry)) {
      throw new Error(errorTextInvalidOperation);
    }
    await profileManagerCore.copyProfile(profileEntry, newProfileEntry);
    const profileData = await profileManagerCore.loadProfile(newProfileEntry);
    const allProfileEntries = await profileManagerCore.listAllProfileEntries();
    commitCoreState({
      allProfileEntries,
      profileEditSource: {
        type: 'InternalProfile',
        profileEntry,
      },
      loadedProfileData: profileData,
    });
  },

  async profile_renameProfile({ newProfileName }) {
    const profileEntry = profilesReader.currentProfileEntry;
    const newProfileEntry = { ...profileEntry, profileName: newProfileName };
    if (profilesReader.hasProfileEntry(newProfileEntry)) {
      throw new Error(errorTextInvalidOperation);
    }
    await profileManagerCore.deleteProfile(profileEntry);
    await profileManagerCore.saveProfile(
      newProfileEntry,
      coreState.editProfileData,
    );
    const profileData = await profileManagerCore.loadProfile(profileEntry);
    const allProfileEntries = await profileManagerCore.listAllProfileEntries();
    commitCoreState({
      allProfileEntries,
      profileEditSource: {
        type: 'InternalProfile',
        profileEntry,
      },
      loadedProfileData: profileData,
    });
  },

  async profile_deleteProfile() {
    const profileEntry = profilesReader.currentProfileEntry;
    await profileManagerCore.deleteProfile(profileEntry);
    const allProfileEntries = await profileManagerCore.listAllProfileEntries();
    const visibleProfileEntries = profilesReader.getVisibleProfiles(
      allProfileEntries,
    );
    if (visibleProfileEntries.length === 0) {
      commitCoreState({
        allProfileEntries,
        profileEditSource: { type: 'NoEditProfileAvailable' },
        loadedProfileData: fallbackProfileData,
      });
    } else {
      const newProfileEntry = visibleProfileEntries[0];
      const profileData = await profileManagerCore.loadProfile(newProfileEntry);
      commitCoreState({
        allProfileEntries,
        profileEditSource: { type: 'InternalProfile', profileEntry },
        loadedProfileData: profileData,
      });
    }
  },
  async profile_saveCurrentProfile({ profileData }) {
    const { profileEditSource: editSource } = coreState;
    if (editSource.type === 'NoEditProfileAvailable') {
    } else if (editSource.type === 'ProfileNewlyCreated') {
    } else if (editSource.type === 'ExternalFile') {
      await profileManagerCore.saveExternalProfileFile(
        editSource.filePath,
        profileData,
      );
    } else if (editSource.type === 'InternalProfile') {
      await profileManagerCore.saveProfile(
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
    if (profilesReader.hasProfileEntry(newProfileEntry)) {
      throw new Error(errorTextInvalidOperation);
    }
    await profileManagerCore.saveProfile(newProfileEntry, profileData);
    const allProfileEntries = await profileManagerCore.listAllProfileEntries();
    const newProfileData = await profileManagerCore.loadProfile(
      newProfileEntry,
    );
    commitCoreState({
      allProfileEntries,
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
    const profile = await loadProfileByEditSource(editSource);
    commitCoreState({
      profileEditSource: editSource,
      loadedProfileData: profile,
    });
  },

  async profile_exportToFile({ filePath, profileData }) {
    await profileManagerCore.saveExternalProfileFile(filePath, profileData);
  },

  async profile_openUserProfilesFolder() {
    const { profileEditSource: editSource } = coreState;
    if (editSource.type === 'InternalProfile' && editSource.profileEntry) {
      await shell.openPath(
        profileManagerCore.getProfilesFolderPath(editSource.profileEntry),
      );
    }
  },
});
