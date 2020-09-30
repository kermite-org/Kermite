import { ProfileProvider } from './ProfileProvider';
import {
  IProfileManagerStatus,
  IProfileManagerCommand
} from '~defs/IpcContract';
import { EditorModel } from '../editor/EditorModel';
import { backendAgent } from '~ui/core/ipc';
import { appUi } from '../../core/appUi';

export class ProfilesModel {
  private profileProvider = new ProfileProvider();

  constructor(private editorModel: EditorModel) {}

  //state
  currentProfileName: string = '';
  allProfileNames: string[] = [];

  //listeners

  private handleProfileStatusChange = (
    payload: Partial<IProfileManagerStatus>
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
    if (payload.errorMessage) {
      alert(payload.errorMessage);
    }
    appUi.rerender();
  };

  initialize() {
    this.profileProvider.setListener(this.handleProfileStatusChange);
    this.profileProvider.initialize();
  }

  finalize() {
    if (this.editorModel.checkDirty()) {
      this.profileProvider.saveProfileOnClosing(this.editorModel.profileData);
    }
    this.profileProvider.finalize();
  }

  //actions

  private getSaveCommandIfDirty() {
    const isDirty = this.editorModel.checkDirty();
    if (isDirty) {
      return {
        saveCurrentProfile: { profileData: this.editorModel.profileData }
      };
    }
    return undefined;
  }

  private sendProfileManagerCommands(
    ...commands: (IProfileManagerCommand | undefined)[]
  ) {
    backendAgent.executeProfileManagerCommands(
      commands.filter((c) => c !== undefined) as IProfileManagerCommand[]
    );
  }

  createProfile = (newProfileName: string, breedName: string) => {
    const saveCommand = this.getSaveCommandIfDirty();
    const createCommand = {
      creatProfile: { name: newProfileName, breedName }
    };
    this.sendProfileManagerCommands(saveCommand, createCommand);
  };

  loadProfile = (profileName: string) => {
    if (profileName === this.currentProfileName) {
      return;
    }
    const saveCommand = this.getSaveCommandIfDirty();
    const loadCommand = { loadProfile: { name: profileName } };
    this.sendProfileManagerCommands(saveCommand, loadCommand);
  };

  renameProfile = (newProfileName: string) => {
    const curProfName = this.currentProfileName;
    const saveCommand = this.getSaveCommandIfDirty();
    const renameCommand = {
      renameProfile: { name: curProfName, newName: newProfileName }
    };
    this.sendProfileManagerCommands(saveCommand, renameCommand);
  };

  copyProfile = (newProfileName: string) => {
    const curProfName = this.currentProfileName;
    const saveCommand = this.getSaveCommandIfDirty();
    const copyCommand = {
      copyProfile: { name: curProfName, newName: newProfileName }
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
}