import { IPresetSpec, IProfileEntry, IResourceOrigin } from '~/shared';
import { dispatchCoreAction } from '~/ui/commonStore';
import { editorModel } from '~/ui/pages/editor-page/models/EditorModel';

export const profilesActions = {
  createProfile: (
    newProfileName: string,
    targetProjectOrigin: IResourceOrigin,
    targetProjectId: string,
    presetSpec: IPresetSpec,
  ) => {
    dispatchCoreAction({
      profile_createProfile: {
        newProfileName,
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
      profile_saveCurrentProfile: { profileData: editorModel.profileData },
    });
  },

  saveUnsavedProfileAs: (newProfileName: string) => {
    dispatchCoreAction({
      profile_saveProfileAs: {
        newProfileName,
        profileData: editorModel.profileData,
      },
    });
  },

  importFromFile: (filePath: string) => {
    dispatchCoreAction({ profile_importFromFile: { filePath } });
  },

  exportToFile: (filePath: string) => {
    dispatchCoreAction({
      profile_exportToFile: { filePath, profileData: editorModel.profileData },
    });
  },

  exportProfileAsProjectPreset: (projectId: string, presetName: string) => {
    dispatchCoreAction({
      profile_saveAsProjectPreset: {
        projectId,
        presetName,
        profileData: editorModel.profileData,
      },
    });
  },

  openUserProfilesFolder: () => {
    dispatchCoreAction({ profile_openUserProfilesFolder: 1 });
  },
};
