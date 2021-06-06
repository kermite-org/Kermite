import {
  compareObjectByJsonStringify,
  IPresetSpec,
  IProfileEditSource,
  IProfileManagerCommand,
  IProfileManagerStatus,
  IResourceOrigin,
} from '~/shared';
import { ipcAgent } from '~/ui/common';
import { EditorModel } from '~/ui/editor-page/models/EditorModel';

export class ProfilesModel {
  constructor(private editorModel: EditorModel) {}

  // state
  editSource: IProfileEditSource = { type: 'NewlyCreated' };
  allProfileNames: string[] = [];

  // listeners

  private handleProfileStatusChange = (
    payload: Partial<IProfileManagerStatus>,
  ) => {
    if (payload.editSource) {
      this.editSource = payload.editSource;
    }
    if (payload.allProfileNames) {
      this.allProfileNames = payload.allProfileNames;
    }
    if (payload.loadedProfileData) {
      if (
        !compareObjectByJsonStringify(
          payload.loadedProfileData,
          this.editorModel.loadedPorfileData,
        )
      ) {
        this.editorModel.loadProfileData(payload.loadedProfileData);
      }
    }
  };

  // reader

  get currentProfileName() {
    return (
      (this.editSource.type === 'InternalProfile' &&
        this.editSource.profileName) ||
      ''
    );
  }

  checkDirty() {
    return this.editorModel.checkDirty(false);
  }

  getCurrentProfileProjectId() {
    return this.editorModel.loadedPorfileData.projectId;
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
    return ipcAgent.async.profile_executeProfileManagerCommands(
      commands.filter((c) => c !== undefined) as IProfileManagerCommand[],
    );
  }

  createProfile = (
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
    this.sendProfileManagerCommands(createCommand);
  };

  loadProfile = (profileName: string) => {
    if (profileName === this.currentProfileName) {
      return;
    }
    const loadCommand = { loadProfile: { name: profileName } };
    this.sendProfileManagerCommands(loadCommand);
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

  saveProfile = async () => {
    const saveCommand = this.getSaveCommandIfDirty();
    if (saveCommand) {
      await this.sendProfileManagerCommands(saveCommand);
    }
  };

  deleteProfile = () => {
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

  importFromFile = (filePath: string) => {
    this.sendProfileManagerCommands({ importFromFile: { filePath } });
  };

  exportToFile = (filePath: string) => {
    this.sendProfileManagerCommands({
      exportToFile: { filePath, profileData: this.editorModel.profileData },
    });
  };

  saveUnsavedProfileAs = (profileName: string) => {
    this.sendProfileManagerCommands({
      saveProfileAs: {
        name: profileName,
        profileData: this.editorModel.profileData,
      },
    });
  };

  startPageSession = () => {
    return ipcAgent.events.profile_profileManagerStatus.subscribe(
      this.handleProfileStatusChange,
    );
  };
}
