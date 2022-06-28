import { IPresetSpec, IProfileEntry, IResourceOrigin } from '~/shared';
import { assignerModel } from '~/ui/featureEditors';
import { dispatchCoreAction } from '~/ui/store';

export const profilesActions = {
  createProfileUnnamed: (
    targetProjectOrigin: IResourceOrigin,
    targetProjectId: string,
    presetSpec: IPresetSpec,
  ) => {
    dispatchCoreAction({
      profile_createProfileUnnamed: {
        targetProjectOrigin,
        targetProjectId,
        presetSpec,
      },
    });
  },

  loadProfile: (profileEntry: IProfileEntry) => {
    dispatchCoreAction({ profile_loadProfile: { profileEntry } });
  },

  renameProfile: (newProfileName: string) => {
    dispatchCoreAction({ profile_renameProfile: { newProfileName } });
  },

  copyProfile: (newProfileName: string) => {
    dispatchCoreAction({ profile_copyProfile: { newProfileName } });
  },

  deleteProfile: () => {
    dispatchCoreAction({ profile_deleteProfile: 1 });
  },

  saveProfile: async () => {
    await dispatchCoreAction({
      profile_saveCurrentProfile: { profileData: assignerModel.profileData },
    });
  },

  saveUnsavedProfileAs: (newProfileName: string) => {
    dispatchCoreAction({
      profile_saveProfileAs: {
        newProfileName,
        profileData: assignerModel.profileData,
      },
    });
  },

  importFromFile: async (fileHandle: FileSystemFileHandle) => {
    await dispatchCoreAction({ profile_importFromFile: { fileHandle } });
  },

  exportToFile: async (fileHandle: FileSystemFileHandle) => {
    await dispatchCoreAction({
      profile_exportToFile: {
        fileHandle,
        profileData: assignerModel.profileData,
      },
    });
  },

  exportProfileAsProjectPreset: (projectId: string, presetName: string) => {
    dispatchCoreAction({
      profile_saveAsProjectPreset: {
        projectId,
        presetName,
        profileData: assignerModel.profileData,
      },
    });
  },
  openUserProfilesFolder: () => {
    dispatchCoreAction({ profile_openUserProfilesFolder: 1 });
  },
};
