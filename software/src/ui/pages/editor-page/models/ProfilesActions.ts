import { IPresetSpec, IProfileManagerCommand, IResourceOrigin } from '~/shared';
import { ipcAgent } from '~/ui/base';
import { editorModel } from '~/ui/pages/editor-page/models/EditorModel';
import { profilesReader } from '~/ui/pages/editor-page/models/ProfilesReader';

const getSaveCommandIfDirty = () => {
  const isDirty = editorModel.checkDirty(true);
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

  loadProfile: (profileName: string) => {
    if (profileName === profilesReader.currentProfileName) {
      return;
    }
    const loadCommand = { loadProfile: { name: profileName } };
    sendProfileManagerCommands(loadCommand);
  },

  renameProfile: (newProfileName: string) => {
    const curProfName = profilesReader.currentProfileName;
    const saveCommand = getSaveCommandIfDirty();
    const renameCommand = {
      renameProfile: { name: curProfName, newName: newProfileName },
    };
    sendProfileManagerCommands(saveCommand, renameCommand);
  },

  copyProfile: (newProfileName: string) => {
    const curProfName = profilesReader.currentProfileName;
    const saveCommand = getSaveCommandIfDirty();
    const copyCommand = {
      copyProfile: { name: curProfName, newName: newProfileName },
    };
    sendProfileManagerCommands(saveCommand, copyCommand);
  },

  deleteProfile: () => {
    const curProfName = profilesReader.currentProfileName;
    const deleteCommand = { deleteProfile: { name: curProfName } };
    sendProfileManagerCommands(deleteCommand);
  },

  saveProfile: async () => {
    const saveCommand = getSaveCommandIfDirty();
    if (saveCommand) {
      await sendProfileManagerCommands(saveCommand);
    }
  },

  saveUnsavedProfileAs: (profileName: string) => {
    sendProfileManagerCommands({
      saveProfileAs: {
        name: profileName,
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
};
