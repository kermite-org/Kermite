import { fallbackProfileData, IProfileData } from '~shared/defs/ProfileData';
import { modalAlert, modalTextEdit } from '~ui/base/dialog/BasicModals';
import { backendAgent } from '~ui/core';
import { ProjectResourceModel } from '~ui/models/ProjectResourceModel';
import { UiStatusModel } from '~ui/models/UiStatusModel';
import { ProfilesModel } from '~ui/models/profile/ProfilesModel';

class PresetBrowserModelHelper {
  static getNewProfileNameBase(
    keyboardName: string,
    presetName: string,
    allProfileNames: string[],
  ): string {
    const presetNameIncluesKeyboardName = presetName
      .toLowerCase()
      .includes(keyboardName.toLowerCase());

    let newProfileNameBase = presetNameIncluesKeyboardName
      ? presetName
      : `${keyboardName}_${presetName}`.toLowerCase();

    if (allProfileNames.includes(newProfileNameBase)) {
      newProfileNameBase += '1';
      // todo: すでにファイルがある場合連番にする
    }
    return newProfileNameBase;
  }

  static checkValidNewProfileName(
    newProfileName: string,
    allProfileNames: string[],
  ): 'ok' | string {
    if (!newProfileName.match(/^[^/./\\:*?"<>|]+$/)) {
      return `${newProfileName} is not for valid filename.`;
    }
    if (allProfileNames.includes(newProfileName)) {
      return `${newProfileName} is already exists.`;
    }
    return 'ok';
  }
}

export class PresetBrowserModel {
  constructor(
    private projectResourceModel: ProjectResourceModel,
    private profilesModel: ProfilesModel,
    private uiStatusModel: UiStatusModel,
  ) {}

  private _currentProjectId: string = '';
  private _currentPresetName: string = '';
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
      this._currentProjectId,
    );
    if (info) {
      return [
        ...info.layoutNames.map((layoutName) => `@${layoutName}`),
        ...info.presetNames,
      ];
    } else {
      return ['@default'];
    }
  }

  setCurrentProjectId = (projectId: string) => {
    this._currentProjectId = projectId;
    this._currentPresetName = this.optionPresetNames[0];
    this.loadSelectedProfile();
  };

  setCurrentPresetName = (presetName: string) => {
    this._currentPresetName = presetName;
    this.loadSelectedProfile();
  };

  private async loadSelectedProfile() {
    const profileData = await backendAgent.loadPresetProfile(
      this._currentProjectId,
      this._currentPresetName,
    );
    if (!profileData) {
      console.error(`error while loading preset profile`);
      return;
    }
    this._loadedProfileData = profileData;
  }

  editSelectedProjectPreset = async () => {
    const {
      _currentProjectId: projectId,
      _currentPresetName: presetName,
    } = this;
    const { allProfileNames } = this.profilesModel;

    const info = this.projectResourceModel.getProjectResourceInfo(projectId);
    if (!info) {
      console.log(`invalid project selection`);
      return;
    }

    const newProfileNameBase = PresetBrowserModelHelper.getNewProfileNameBase(
      info.keyboardName,
      presetName,
      allProfileNames,
    );

    const newProfileName = await modalTextEdit({
      message: 'new profile name',
      defaultText: newProfileNameBase,
      caption: 'create profile',
    });
    if (!newProfileName) {
      return;
    }
    const checkRes = PresetBrowserModelHelper.checkValidNewProfileName(
      newProfileName,
      allProfileNames,
    );
    if (checkRes !== 'ok') {
      await modalAlert(`${checkRes} operation cancelled.`);
      return;
    }

    this.profilesModel.createProfile(newProfileName, projectId, presetName);
    this.uiStatusModel.navigateTo('editor');
  };

  initialize() {
    const resourceInfos = this.projectResourceModel.projectResourceInfos;
    if (resourceInfos.length > 0) {
      this._currentProjectId = resourceInfos[0].projectId;
      this._currentPresetName = this.optionPresetNames[0];
      this.loadSelectedProfile();
    }
  }
}
