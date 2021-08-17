import { useEffect } from 'qx';
import {
  compareObjectByJsonStringify,
  IPresetSpec,
  IProfileManagerCommand,
  IProfileManagerStatus,
  IResourceOrigin,
} from '~/shared';
import { ipcAgent } from '~/ui/base';
import { uiState } from '~/ui/commonStore';
import { editorModel } from '~/ui/pages/editor-page/models/EditorModel';

export interface IProfilesModel {
  checkDirty(): boolean;

  createProfile(
    newProfileName: string,
    targetProjectOrigin: IResourceOrigin,
    targetProjectId: string,
    presetSpec: IPresetSpec,
  ): void;
  loadProfile(profileName: string): void;
  renameProfile(newProfileName: string): void;
  copyProfile(newProfileName: string): void;
  saveProfile(): Promise<void>;
  deleteProfile(): void;
  exportProfileAsProjectPreset(projectId: string, presetName: string): void;
  importFromFile(filePath: string): void;
  exportToFile(filePath: string): void;
  saveUnsavedProfileAs(profileName: string): void;
}

export const profilesReader = {
  get editSource() {
    return uiState.core.profileManagerStatus.editSource;
  },
  get allProfileEntries() {
    return uiState.core.profileManagerStatus.allProfileEntries;
  },
  get isEditProfileAvailable() {
    const { editSource } = uiState.core.profileManagerStatus;
    return editSource.type !== 'NoProfilesAvailable';
  },
  get currentProfileName() {
    const { editSource } = uiState.core.profileManagerStatus;
    return (
      (editSource.type === 'InternalProfile' && editSource.profileName) || ''
    );
  },
};

const checkDirty = () => editorModel.checkDirty(false);

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

const profilesActions = {
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

export const profilesModel: IProfilesModel = {
  checkDirty,
  ...profilesActions,
};

export function updateProfilesModelOnRender() {
  const handleProfileStatusChange = (status: IProfileManagerStatus) => {
    if (
      !compareObjectByJsonStringify(
        status.loadedProfileData,
        editorModel.loadedProfileData,
      )
    ) {
      editorModel.loadProfileData(status.loadedProfileData);
    }
  };
  const status = uiState.core.profileManagerStatus;
  useEffect(() => handleProfileStatusChange(status), [status]);
}
