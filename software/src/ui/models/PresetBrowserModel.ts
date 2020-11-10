import { fallbackProfileData, IProfileData } from '~defs/ProfileData';
import { modalAlert, modalTextEdit } from '~ui/base/dialog/BasicModals';
import { backendAgent } from '~ui/core';
import { ProjectResourceModel } from '~ui/models/ProjectResourceModel';
import { UiStatusModel } from '~ui/models/UiStatusModel';
import { ProfilesModel } from '~ui/models/profile/ProfilesModel';

export class PresetBrowserModel {
  constructor(
    private projectResourceModel: ProjectResourceModel,
    private profilesModel: ProfilesModel,
    private uiStatusModel: UiStatusModel
  ) {}

  private _currentProjectId: string = '';
  private _currentPresetName: string = 'blank';
  private _loadedProfileData: IProfileData = fallbackProfileData;

  get currentProjectId() {
    return this._currentProjectId;
  }

  get currentPresetName() {
    return this._currentPresetName;
  }

  get loadedProfileData() {
    return this._loadedProfileData;
  }

  get optionProjectInfos() {
    return this.projectResourceModel.getProjectsWithLayout();
  }

  get optionPresetNames() {
    const info = this.projectResourceModel.getProjectResourceInfo(
      this._currentProjectId
    );
    return info?.presetNames ? ['blank', ...info.presetNames] : ['blank'];
  }

  setCurrentProjectId = (projectId: string) => {
    this._currentProjectId = projectId;
    this._currentPresetName = 'blank';
    this.loadSelectedProfile();
  };

  setCurrentPresetName = (presetName: string) => {
    this._currentPresetName = presetName;
    this.loadSelectedProfile();
  };

  private async loadSelectedProfile() {
    const profileData = await backendAgent.loadPresetProfile(
      this._currentProjectId,
      this._currentPresetName === 'blank' ? undefined : this._currentPresetName
    );
    if (!profileData) {
      console.error(`errro while loading preset profile`);
      return;
    }
    this._loadedProfileData = profileData;
  }

  private checkValidNewProfileName = async (
    newProfileName: string
  ): Promise<boolean> => {
    if (!newProfileName.match(/^[^/./\\:*?"<>|]+$/)) {
      await modalAlert(
        `${newProfileName} is not for valid filename. operation cancelled.`
      );
      return false;
    }
    if (this.profilesModel.allProfileNames.includes(newProfileName)) {
      await modalAlert(
        `${newProfileName} is already exists. operation cancelled.`
      );
      return false;
    }
    return true;
  };

  editSelectedProjectPreset = async () => {
    const {
      _currentProjectId: projectId,
      _currentPresetName: presetName
    } = this;
    const info = this.projectResourceModel.getProjectResourceInfo(projectId);
    if (!info) {
      console.log(`invalid project selection`);
      return;
    }
    const { projectName } = info;

    const presetNameIncluesProjectName = presetName
      .toLowerCase()
      .includes(projectName.toLowerCase());
    let newProfileNameBase = presetNameIncluesProjectName
      ? presetName
      : `${projectName}_${presetName}`.toLowerCase();
    if (this.profilesModel.allProfileNames.includes(newProfileNameBase)) {
      newProfileNameBase += '1';
      // todo: すでにファイルがある場合連番にする
    }
    const newProfileName = await modalTextEdit({
      message: 'new profile name',
      defaultText: newProfileNameBase,
      caption: 'create profile'
    });
    if (!newProfileName) {
      return;
    }
    const nameValid = await this.checkValidNewProfileName(newProfileName);
    if (nameValid) {
      this.profilesModel.createProfile(
        newProfileName,
        projectId,
        presetName === 'blank' ? undefined : presetName
      );
      this.uiStatusModel.navigateTo('editor');
    }
  };

  initialize() {
    const resourceInfos = this.projectResourceModel.projectResourceInfos;
    if (resourceInfos.length > 0) {
      this._currentProjectId = resourceInfos[0].projectId;
      this._currentPresetName = 'blank';
      this.loadSelectedProfile();
    }
  }
}
