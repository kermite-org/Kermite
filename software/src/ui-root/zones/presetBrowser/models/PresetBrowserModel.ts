import { IProfileData, fallbackProfileData, IPresetSpec } from '~/shared';
import { ipcAgent } from '~/ui-common';
import {
  modalTextEdit,
  modalAlert,
} from '~/ui-common/fundamental/dialog/BasicModals';
import { createSimpleSelector } from '~/ui-layouter/editor/store';
import {
  projectResourceModel,
  ProjectResourceModel,
} from '~/ui-root/zones/common/commonModels/ProjectResourceModel';
import {
  uiStatusModel,
  UiStatusModel,
} from '~/ui-root/zones/common/commonModels/UiStatusModel';
import {
  profilesModel,
  ProfilesModel,
} from '~/ui-root/zones/editorProfilesSection/models/ProfilesModel';

class PresetBrowserModelHelper {
  static getNewProfileNameBase(
    keyboardName: string,
    profileSourceName: string,
    allProfileNames: string[],
  ): string {
    const isProfileSourceIncluesKeyboardName = profileSourceName
      .toLowerCase()
      .includes(keyboardName.toLowerCase());

    let newProfileNameBase = isProfileSourceIncluesKeyboardName
      ? profileSourceName
      : `${keyboardName}_${profileSourceName}`.toLowerCase();

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

type IPresetSpecWithId = IPresetSpec & { id: string };
export class PresetBrowserModel {
  constructor(
    private projectResourceModel: ProjectResourceModel,
    private profilesModel: ProfilesModel,
    private uiStatusModel: UiStatusModel,
  ) {}

  private _currentProjectId: string | undefined;
  private _currentPresetSpecId: string | undefined;
  private _loadedProfileData: IProfileData = fallbackProfileData;

  get currentProjectId() {
    return this._currentProjectId;
  }

  get currentPresetSpecId() {
    return this._currentPresetSpecId;
  }

  get loadedProfileData() {
    return this._loadedProfileData;
  }

  get optionProjectInfos() {
    return this.projectResourceModel.getProjectsWithLayout();
  }

  private optionPresetSpecsSelector = createSimpleSelector(
    () =>
      this.projectResourceModel.getProjectResourceInfo(
        this._currentProjectId || '',
      ),
    (info) =>
      (info && [
        ...info.layoutNames.map((layoutName) => ({
          id: `blank$${layoutName}`,
          type: 'blank' as const,
          layoutName,
        })),
        ...info.presetNames.map((presetName) => ({
          id: `preset$${presetName}`,
          type: 'preset' as const,
          presetName,
        })),
      ]) ||
      [],
  );

  get optionPresetSpecs(): IPresetSpecWithId[] {
    return this.optionPresetSpecsSelector();
  }

  private getPresetSpecById(id: string) {
    return this.optionPresetSpecs.find((it) => it.id === id);
  }

  setCurrentProjectId = (projectId: string) => {
    this._currentProjectId = projectId;
    this._currentPresetSpecId = this.optionPresetSpecs[0]?.id;
    this.loadSelectedProfile();
  };

  setCurrentPresetSpecId = (specId: string) => {
    this._currentPresetSpecId = specId;
    this.loadSelectedProfile();
  };

  private async loadSelectedProfile() {
    if (!(this._currentProjectId && this._currentPresetSpecId)) {
      return;
    }
    const spec = this.getPresetSpecById(this._currentPresetSpecId);
    if (spec) {
      const profileData = await ipcAgent.async.projects_loadPresetProfile(
        this._currentProjectId,
        spec,
      );
      if (!profileData) {
        console.error(`error while loading preset profile`);
        return;
      }
      this._loadedProfileData = profileData;
    }
  }

  editSelectedProjectPreset = async () => {
    const {
      _currentProjectId: projectId,
      _currentPresetSpecId: presetSpecId,
    } = this;
    if (!(projectId && presetSpecId)) {
      return;
    }
    const { allProfileNames } = this.profilesModel;

    const info = this.projectResourceModel.getProjectResourceInfo(projectId);
    if (!info) {
      console.log(`invalid project selection`);
      return;
    }
    const spec = this.getPresetSpecById(presetSpecId);
    if (!spec) {
      return;
    }
    const newProfileNameBase = PresetBrowserModelHelper.getNewProfileNameBase(
      info.keyboardName,
      spec.type === 'preset' ? spec.presetName : spec.layoutName,
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

    this.profilesModel.createProfile(newProfileName, projectId, spec);
    this.uiStatusModel.navigateTo('editor');
  };

  initialize() {
    const resourceInfos = this.projectResourceModel.projectResourceInfos;
    if (resourceInfos.length > 0) {
      this._currentProjectId = resourceInfos[0].projectId;
      this._currentPresetSpecId = this.optionPresetSpecs[0]?.id;
      this.loadSelectedProfile();
    }
  }
}

export const presetBrowserModel = new PresetBrowserModel(
  projectResourceModel,
  profilesModel,
  uiStatusModel,
);
