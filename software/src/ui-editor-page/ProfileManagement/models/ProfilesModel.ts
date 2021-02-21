import {
  IPresetSpec,
  IProfileManagerCommand,
  IProfileManagerStatus,
  IResourceOrigin,
} from '~/shared';
import { ipcAgent } from '~/ui-common';
import { EditorModel } from '../../EditorMainPart/models/EditorModel';
import { ProfileProvider } from './ProfileProvider';

const useAutoSave = false;

export class ProfilesModel {
  private profileProvider = new ProfileProvider();

  constructor(private editorModel: EditorModel) {}

  // state
  currentProfileName: string = '';
  allProfileNames: string[] = [];

  // listeners

  private handleProfileStatusChange = (
    payload: Partial<IProfileManagerStatus>,
  ) => {
    if (payload.currentProfileName) {
      this.currentProfileName = payload.currentProfileName;
    }
    if (payload.allProfileNames) {
      this.allProfileNames = payload.allProfileNames;
    }
    if (payload.loadedProfileData) {
      this.editorModel.loadProfileData(payload.loadedProfileData);
    }
  };

  // reader

  checkDirty() {
    return this.editorModel.checkDirty(false);
  }

  // actions

  private getSaveCommandIfDirty() {
    const isDirty = this.editorModel.checkDirty(true);
    if (isDirty) {
      return {
        saveCurrentProfile: { profileData: this.editorModel.profileData },
      };
    }
    return undefined;
  }

  private sendProfileManagerCommands(
    ...commands: (IProfileManagerCommand | undefined)[]
  ) {
    ipcAgent.async.profile_executeProfileManagerCommands(
      commands.filter((c) => c !== undefined) as IProfileManagerCommand[],
    );
  }

  createProfile = (
    newProfileName: string,
    targetProjectOrigin: IResourceOrigin,
    targetProjectId: string,
    presetSpec: IPresetSpec,
  ) => {
    const saveCommand =
      (useAutoSave && this.getSaveCommandIfDirty()) || undefined;
    const createCommand = {
      creatProfile: {
        name: newProfileName,
        targetProjectOrigin,
        targetProjectId,
        presetSpec,
      },
    };
    this.sendProfileManagerCommands(saveCommand, createCommand);
  };

  loadProfile = (profileName: string) => {
    if (profileName === this.currentProfileName) {
      return;
    }
    const saveCommand =
      (useAutoSave && this.getSaveCommandIfDirty()) || undefined;
    const loadCommand = { loadProfile: { name: profileName } };
    this.sendProfileManagerCommands(saveCommand, loadCommand);
  };

  renameProfile = (newProfileName: string) => {
    const curProfName = this.currentProfileName;
    const saveCommand = this.getSaveCommandIfDirty();
    const renameCommand = {
      renameProfile: { name: curProfName, newName: newProfileName },
    };
    this.sendProfileManagerCommands(saveCommand, renameCommand);
  };

  copyProfile = (newProfileName: string) => {
    const curProfName = this.currentProfileName;
    const saveCommand = this.getSaveCommandIfDirty();
    const copyCommand = {
      copyProfile: { name: curProfName, newName: newProfileName },
    };
    this.sendProfileManagerCommands(saveCommand, copyCommand);
  };

  saveProfile = () => {
    const saveCommand = this.getSaveCommandIfDirty();
    if (saveCommand) {
      this.sendProfileManagerCommands(saveCommand);
    }
  };

  deleteProfile = async () => {
    const curProfName = this.currentProfileName;
    const deleteCommand = { deleteProfile: { name: curProfName } };
    this.sendProfileManagerCommands(deleteCommand);
  };

  exportProfileAsProjectPreset = (projectId: string, presetName: string) => {
    const exportCommand: Partial<IProfileManagerCommand> = {
      saveAsProjectPreset: {
        projectId,
        presetName,
        profileData: this.editorModel.profileData,
      },
    };
    this.sendProfileManagerCommands(exportCommand);
  };

  initialize() {
    this.profileProvider.setListener(this.handleProfileStatusChange);
    this.profileProvider.initialize();
  }

  finalize() {
    if (useAutoSave && this.editorModel.checkDirty(true)) {
      this.profileProvider.saveProfileOnClosing(this.editorModel.profileData);
    }
    this.profileProvider.finalize();
  }
}
