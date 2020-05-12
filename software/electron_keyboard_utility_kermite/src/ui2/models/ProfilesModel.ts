import { ProfileProvider2 } from './dataSource/ProfileProvider2';
import { IProfileManagerStatus } from '~defs/ipc';
import { EditorModel } from './EditorModel';
import { sendProfileManagerCommands } from '~ui2/models/dataSource/ipc';
import { appUi } from './appGlobal';
import { removeInvalidProfileAssigns } from './ProfileDataHelper';

export class ProfilesModel {
  private profileProvider = new ProfileProvider2();

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

  createProfile = (newProfileName: string, breedName: string) => {
    const saveCommand = this.getSaveCommandIfDirty();
    const createCommand = {
      creatProfile: { name: newProfileName, breedName }
    };
    sendProfileManagerCommands(saveCommand, createCommand);
  };

  loadProfile = (profileName: string) => {
    if (profileName === this.currentProfileName) {
      return;
    }
    const saveCommand = this.getSaveCommandIfDirty();
    const loadCommand = { loadProfile: { name: profileName } };
    sendProfileManagerCommands(saveCommand, loadCommand);
  };

  renameProfile = (newProfileName: string) => {
    const curProfName = this.currentProfileName;
    const saveCommand = this.getSaveCommandIfDirty();
    const renameCommand = {
      renameProfile: { name: curProfName, newName: newProfileName }
    };
    sendProfileManagerCommands(saveCommand, renameCommand);
  };

  copyProfile = (newProfileName: string) => {
    const curProfName = this.currentProfileName;
    const saveCommand = this.getSaveCommandIfDirty();
    const copyCommand = {
      copyProfile: { name: curProfName, newName: newProfileName }
    };
    sendProfileManagerCommands(saveCommand, copyCommand);
  };

  saveProfile = () => {
    const saveCommand = this.getSaveCommandIfDirty();
    if (saveCommand) {
      sendProfileManagerCommands(saveCommand);
    }
  };

  deleteProfile = async () => {
    const curProfName = this.currentProfileName;
    const deleteCommand = { deleteProfile: { name: curProfName } };
    sendProfileManagerCommands(deleteCommand);
  };
}
