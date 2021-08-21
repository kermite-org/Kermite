import {
  IPresetSpec,
  IProfileEntry,
  IProfileManagerCommand,
  IResourceOrigin,
} from '~/shared';
import { ipcAgent } from '~/ui/base';
import { editorModel } from '~/ui/pages/editor-page/models/EditorModel';

const getSaveCommandIfDirty = () => {
  const isDirty = editorModel.checkDirtyWithCleanupSideEffect();
  if (isDirty) {
    return {
      saveCurrentProfile: { profileData: editorModel.profileData },
    };
  }
  return undefined;
};

const sendProfileManagerCommands = (
  ...commands: (IProfileManagerCommand | undefined)[]
) => {
  return ipcAgent.async.profile_executeProfileManagerCommands(
    commands.filter((c) => c !== undefined) as IProfileManagerCommand[],
  );
};

export const profilesActions = {
  createProfile: (
    newProfileName: string,
    targetProjectOrigin: IResourceOrigin,
    targetProjectId: string,
    presetSpec: IPresetSpec,
  ) => {
    const createCommand = {
      creatProfile: {
        name: newProfileName,
        targetProjectOrigin,
        targetProjectId,
        presetSpec,
      },
    };
    sendProfileManagerCommands(createCommand);
  },

  loadProfile: (profileEntry: IProfileEntry) => {
    const loadCommand = { loadProfile: { profileEntry } };
    sendProfileManagerCommands(loadCommand);
  },

  renameProfile: (profileEntry: IProfileEntry, newProfileName: string) => {
    const saveCommand = getSaveCommandIfDirty();
    const renameCommand = {
      renameProfile: { profileEntry, newProfileName },
    };
    sendProfileManagerCommands(saveCommand, renameCommand);
  },

  copyProfile: (profileEntry: IProfileEntry, newProfileName: string) => {
    const saveCommand = getSaveCommandIfDirty();
    const copyCommand = {
      copyProfile: { profileEntry, newProfileName },
    };
    sendProfileManagerCommands(saveCommand, copyCommand);
  },

  deleteProfile: (profileEntry: IProfileEntry) => {
    const deleteCommand = { deleteProfile: { profileEntry } };
    sendProfileManagerCommands(deleteCommand);
  },

  saveProfile: async () => {
    const saveCommand = getSaveCommandIfDirty();
    if (saveCommand) {
      await sendProfileManagerCommands(saveCommand);
    }
  },

  saveUnsavedProfileAs: (newProfileName: string) => {
    sendProfileManagerCommands({
      saveProfileAs: {
        newProfileName,
        profileData: editorModel.profileData,
      },
    });
  },

  importFromFile: (filePath: string) => {
    sendProfileManagerCommands({ importFromFile: { filePath } });
  },

  exportToFile: (filePath: string) => {
    sendProfileManagerCommands({
      exportToFile: { filePath, profileData: editorModel.profileData },
    });
  },

  exportProfileAsProjectPreset: (projectId: string, presetName: string) => {
    const exportCommand: Partial<IProfileManagerCommand> = {
      saveAsProjectPreset: {
        projectId,
        presetName,
        profileData: editorModel.profileData,
      },
    };
    sendProfileManagerCommands(exportCommand);
  },

  openUserProfilesFolder: () => {
    sendProfileManagerCommands({ openUserProfilesFolder: 1 });
  },
};
