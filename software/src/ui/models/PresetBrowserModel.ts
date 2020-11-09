import { fallbackProfileData, IProfileData } from '~defs/ProfileData';
import { backendAgent } from '~ui/core';
import { ProjectResourceModel } from '~ui/models/ProjectResourceModel';

export class PresetBrowserModel {
  constructor(private projectResourceModel: ProjectResourceModel) {}

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

  editSelectedProjectPreset = () => {
    const {
      _currentProjectId: selectedProjectId,
      _currentPresetName: selectedPresetName
    } = this;
    console.log({ selectedProjectId, selectedPresetName });
    const info = this.projectResourceModel.getProjectResourceInfo(
      selectedProjectId
    );
    if (!info) {
      console.log(`invalid project selection`);
    }
    // const projectName = info?.projectName;
    // const { allProfileNames } = this.profilesModel;
  };

  private onResourceModelLoaded = () => {
    const resourceInfos = this.projectResourceModel.projectResourceInfos;
    if (resourceInfos.length > 0) {
      this._currentProjectId = resourceInfos[0].projectId;
      this._currentPresetName = 'blank';
      this.loadSelectedProfile();
    }
  };

  initialize() {
    this.projectResourceModel.loadedNotifier.listen(this.onResourceModelLoaded);
  }
}
