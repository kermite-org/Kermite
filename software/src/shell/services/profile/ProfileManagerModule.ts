import { shell } from 'electron';
import produce from 'immer';
import {
  duplicateObjectByJsonStringifyParse,
  fallbackProfileData,
  IProfileEditSource,
} from '~/shared';
import { ProfileDataConverter } from '~/shared/modules/ProfileDataConverter';
import {
  commitCoreState,
  coreState,
  createCoreModule,
  dispatchCoreAction,
  profilesReader,
} from '~/shell/global';
import { presetProfileLoader_loadPresetProfileData } from '~/shell/services/profile/PresetProfileLoader';
import { profileManagerCore } from '~/shell/services/profile/ProfileManagerCore';

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
    const profileData = presetProfileLoader_loadPresetProfileData(
      origin,
      projectId,
      presetSpec,
    );
    if (!profileData) {
      throw new Error('failed to load profile');
    }
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
    const profileData = presetProfileLoader_loadPresetProfileData(
      origin,
      projectId,
      presetSpec,
    );
    if (!profileData) {
      throw new Error('failed to load profile');
    }
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

  async profile_renameProfile({ newProfileName }) {
    const profileEntry = profilesReader.getCurrentInternalProfileEntry();
    if (!profileEntry) {
      throw new Error(errorTextInvalidOperation);
    }
    const newProfileEntry = { ...profileEntry, profileName: newProfileName };
    if (profilesReader.hasProfileEntry(newProfileEntry)) {
      throw new Error(errorTextInvalidOperation);
    }
    await profileManagerCore.deleteProfile(profileEntry);
    await profileManagerCore.saveProfile(
      newProfileEntry,
      coreState.editProfileData,
    );
    const profileData = await profileManagerCore.loadProfile(newProfileEntry);
    const allProfileEntries = await profileManagerCore.listAllProfileEntries();
    commitCoreState({
      allProfileEntries,
      profileEditSource: {
        type: 'InternalProfile',
        profileEntry: newProfileEntry,
      },
      loadedProfileData: profileData,
    });
  },

  async profile_copyProfile({ newProfileName }) {
    const profileEntry = profilesReader.getCurrentInternalProfileEntry();
    if (!profileEntry) {
      throw new Error(errorTextInvalidOperation);
    }
    const newProfileEntry = { ...profileEntry, profileName: newProfileName };
    if (profilesReader.hasProfileEntry(newProfileEntry)) {
      throw new Error(errorTextInvalidOperation);
    }
    await profileManagerCore.deleteProfile(profileEntry);
    await profileManagerCore.saveProfile(
      newProfileEntry,
      coreState.editProfileData,
    );
    const profileData = await profileManagerCore.loadProfile(newProfileEntry);
    const allProfileEntries = await profileManagerCore.listAllProfileEntries();
    commitCoreState({
      allProfileEntries,
      profileEditSource: {
        type: 'InternalProfile',
        profileEntry: newProfileEntry,
      },
      loadedProfileData: profileData,
    });
  },

  async profile_deleteProfile() {
    const profileEntry = profilesReader.getCurrentInternalProfileEntry();
    if (!profileEntry) {
      throw new Error(errorTextInvalidOperation);
    }
    await profileManagerCore.deleteProfile(profileEntry);
    const allProfileEntries = await profileManagerCore.listAllProfileEntries();
    const visibleProfileEntries = profilesReader.getVisibleProfiles(
      allProfileEntries,
    );
    const newProfileEntry =
      visibleProfileEntries.find(
        (it) => it.projectId === profileEntry.projectId,
      ) || visibleProfileEntries[0];
    if (newProfileEntry) {
      const profileData = await profileManagerCore.loadProfile(newProfileEntry);
      commitCoreState({
        allProfileEntries,
        profileEditSource: {
          type: 'InternalProfile',
          profileEntry: newProfileEntry,
        },
        loadedProfileData: profileData,
      });
    } else {
      commitCoreState({
        allProfileEntries,
        profileEditSource: { type: 'NoEditProfileAvailable' },
        loadedProfileData: fallbackProfileData,
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
    const profile = await profileManagerCore.loadExternalProfileFile(filePath);
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
