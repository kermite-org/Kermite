import produce from 'immer';
import {
  duplicateObjectByJsonStringifyParse,
  fallbackProfileData,
  IProfileData,
  IProfileEntry,
  ProfileDataConverter,
} from '~/shared';
import {
  commitCoreState,
  coreState,
  createCoreModule,
  dispatchCoreAction,
  profilesReader,
} from '~/shell/modules/core';
import { presetProfileLoader_loadPresetProfileData } from '~/shell/modules/profile/presetProfileLoader';
import { profileManagerCore } from '~/shell/modules/profile/profileManagerCore';

const errorTextInvalidOperation = 'invalid operation';

const profileManagerInternalFuncs = {
  saveProfileWithProjectIdChange(
    profileEntry: IProfileEntry,
    profileData: IProfileData,
  ) {
    if (profileData.projectId !== profileEntry.projectId) {
      profileManagerCore.deleteProfile(profileEntry);
    }
    const newProfileEntry = {
      ...profileEntry,
      projectId: profileData.projectId,
    };
    profileManagerCore.saveProfile(newProfileEntry, profileData);
    const allProfileEntries = profileManagerCore.listAllProfileEntries();
    commitCoreState({
      allProfileEntries,
      profileEditSource: {
        type: 'InternalProfile',
        profileEntry: newProfileEntry,
      },
      loadedProfileData: profileData,
    });
  },
};

export const profileManagerModule = createCoreModule({
  profile_createProfile({
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
    profileManagerCore.saveProfile(profileEntry, profileData);
    const allProfileEntries = profileManagerCore.listAllProfileEntries();
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
    const sourceProfileName =
      presetSpec.type === 'preset' ? presetSpec.presetName : undefined;

    commitCoreState({
      profileEditSource: { type: 'ProfileNewlyCreated', sourceProfileName },
      loadedProfileData: profileData,
    });
  },
  profile_createProfileExternal({ profileData, sourceProfileName }) {
    commitCoreState({
      profileEditSource: { type: 'ProfileNewlyCreated', sourceProfileName },
      loadedProfileData: profileData,
    });
  },
  profile_createProfileFromLayout({ projectId, layout }) {
    const profileData =
      duplicateObjectByJsonStringifyParse(fallbackProfileData);
    profileData.projectId = projectId;
    profileData.keyboardDesign = layout;
    commitCoreState({
      profileEditSource: { type: 'ProfileNewlyCreated' },
      loadedProfileData: profileData,
    });
  },

  profile_loadProfile({ profileEntry }) {
    const profileData = profileManagerCore.loadProfile(profileEntry);
    commitCoreState({
      profileEditSource: {
        type: 'InternalProfile',
        profileEntry,
      },
      loadedProfileData: profileData,
    });
  },

  profile_renameProfile({ newProfileName }) {
    const profileEntry = profilesReader.getCurrentInternalProfileEntry();
    if (!profileEntry) {
      throw new Error(errorTextInvalidOperation);
    }
    const newProfileEntry = { ...profileEntry, profileName: newProfileName };
    if (profilesReader.hasProfileEntry(newProfileEntry)) {
      throw new Error(errorTextInvalidOperation);
    }
    profileManagerCore.deleteProfile(profileEntry);
    profileManagerCore.saveProfile(newProfileEntry, coreState.editProfileData);
    const profileData = profileManagerCore.loadProfile(newProfileEntry);
    const allProfileEntries = profileManagerCore.listAllProfileEntries();
    commitCoreState({
      allProfileEntries,
      profileEditSource: {
        type: 'InternalProfile',
        profileEntry: newProfileEntry,
      },
      loadedProfileData: profileData,
    });
  },

  profile_copyProfile({ newProfileName }) {
    const profileEntry = profilesReader.getCurrentInternalProfileEntry();
    if (!profileEntry) {
      throw new Error(errorTextInvalidOperation);
    }
    const newProfileEntry = { ...profileEntry, profileName: newProfileName };
    if (profilesReader.hasProfileEntry(newProfileEntry)) {
      throw new Error(errorTextInvalidOperation);
    }
    profileManagerCore.saveProfile(newProfileEntry, coreState.editProfileData);
    const profileData = profileManagerCore.loadProfile(newProfileEntry);
    const allProfileEntries = profileManagerCore.listAllProfileEntries();
    commitCoreState({
      allProfileEntries,
      profileEditSource: {
        type: 'InternalProfile',
        profileEntry: newProfileEntry,
      },
      loadedProfileData: profileData,
    });
  },

  profile_deleteProfile() {
    const profileEntry = profilesReader.getCurrentInternalProfileEntry();
    if (!profileEntry) {
      throw new Error(errorTextInvalidOperation);
    }
    profileManagerCore.deleteProfile(profileEntry);
    const allProfileEntries = profileManagerCore.listAllProfileEntries();
    const visibleProfileEntries =
      profilesReader.getVisibleProfiles(allProfileEntries);
    const newProfileEntry =
      visibleProfileEntries.find(
        (it) => it.projectId === profileEntry.projectId,
      ) || visibleProfileEntries[0];
    if (newProfileEntry) {
      const profileData = profileManagerCore.loadProfile(newProfileEntry);
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
  profile_saveCurrentProfile({ profileData }) {
    const { profileEditSource: editSource } = coreState;
    if (editSource.type === 'NoEditProfileAvailable') {
    } else if (editSource.type === 'ProfileNewlyCreated') {
    } else if (editSource.type === 'InternalProfile') {
      if (editSource.profileEntry.projectId !== profileData.projectId) {
        profileManagerInternalFuncs.saveProfileWithProjectIdChange(
          editSource.profileEntry,
          profileData,
        );
        return;
      } else {
        profileManagerCore.saveProfile(editSource.profileEntry, profileData);
      }
    }
    commitCoreState({
      loadedProfileData: profileData,
    });
  },

  profile_saveProfileAs({ profileData, newProfileName }) {
    const newProfileEntry = {
      projectId: profileData.projectId,
      profileName: newProfileName,
    };
    if (!newProfileEntry.projectId) {
      throw new Error('blank project id');
    }
    // if (profilesReader.hasProfileEntry(newProfileEntry)) {
    //   throw new Error(errorTextInvalidOperation);
    // }
    profileManagerCore.saveProfile(newProfileEntry, profileData);
    const allProfileEntries = profileManagerCore.listAllProfileEntries();
    const newProfileData = profileManagerCore.loadProfile(newProfileEntry);
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
      const preset =
        ProfileDataConverter.convertProfileDataToPersist(profileData);
      const newProjectInfo = produce(projectInfo, (draft) => {
        const profile = draft.profiles.find(
          (it) => it.profileName === presetName,
        );
        if (profile) {
          profile.data = preset;
        } else {
          draft.profiles.push({
            profileName: presetName,
            data: preset,
          });
        }
      });
      dispatchCoreAction({
        project_saveLocalProjectPackageInfo: newProjectInfo,
      });
    }
  },

  async profile_importFromFile({ fileHandle }) {
    const profile = await profileManagerCore.loadExternalProfileFile(
      fileHandle,
    );
    commitCoreState({
      profileEditSource: { type: 'ProfileNewlyCreated' },
      loadedProfileData: profile,
    });
  },

  async profile_exportToFile({ fileHandle, profileData }) {
    await profileManagerCore.saveExternalProfileFile(fileHandle, profileData);
  },
  async profile_postProfileToServerSite({ profileData }) {
    const profileEntry = profilesReader.getCurrentInternalProfileEntry();
    if (profileEntry) {
      await profileManagerCore.postProfileToServerSite(
        profileEntry,
        profileData,
      );
    } else {
      throw new Error(errorTextInvalidOperation);
    }
  },

  profile_openUserProfilesFolder() {
    // const { profileEditSource: editSource } = coreState;
    // if (editSource.type === 'InternalProfile' && editSource.profileEntry) {
    //   await shell.openPath(
    //     profileManagerCore.getProfilesFolderPath(editSource.profileEntry),
    //   );
    // }
    throw new Error('obsolete function invoked');
  },
});
