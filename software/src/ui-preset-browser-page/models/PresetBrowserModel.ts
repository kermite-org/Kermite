import {
  fallbackProfileData,
  IPresetSpec,
  IProfileData,
  IResourceOrigin,
} from '~/shared';
import { getProjectOriginAndIdFromSig } from '~/shared/funcs/DomainRelatedHelpers';
import { ipcAgent } from '~/ui-common';
import {
  modalAlert,
  modalTextEdit,
} from '~/ui-common/fundamental/dialog/BasicModals';
import { createSimpleSelector } from '~/ui-common/helpers/StoreUtils';
import { ProjectResourceModel } from '~/ui-common/sharedModels/ProjectResourceModel';
import { uiStatusModel } from '~/ui-common/sharedModels/UiStatusModel';

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

  static createProfile(
    newProfileName: string,
    targetProjectOrigin: IResourceOrigin,
    targetProjectId: string,
    presetSpec: IPresetSpec,
  ) {
    const createCommand = {
      creatProfile: {
        name: newProfileName,
        targetProjectOrigin,
        targetProjectId,
        presetSpec,
      },
    };
    ipcAgent.async.profile_executeProfileManagerCommands([createCommand]);
  }
}

type IPresetSpecWithId = IPresetSpec & { id: string };
export class PresetBrowserModel {
  private projectResourceModel = new ProjectResourceModel();
  private allProfileNames: string[] = [];

  private _currentProjecSig: string | undefined;
  private _currentPresetSpecId: string | undefined;
  private _loadedProfileData: IProfileData = fallbackProfileData;

  get currentProjectSig() {
    return this._currentProjecSig;
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
        this._currentProjecSig || '',
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
    return this.optionPresetSpecsSelector() || [];
  }

  private getPresetSpecById(id: string) {
    return this.optionPresetSpecs.find((it) => it.id === id);
  }

  setCurrentProjectSig = (projectSig: string) => {
    this._currentProjecSig = projectSig;
    this._currentPresetSpecId = this.optionPresetSpecs[0]?.id;
    this.loadSelectedProfile();
  };

  setCurrentPresetSpecId = (specId: string) => {
    this._currentPresetSpecId = specId;
    this.loadSelectedProfile();
  };

  private async loadSelectedProfile() {
    if (!(this._currentProjecSig && this._currentPresetSpecId)) {
      return;
    }
    const spec = this.getPresetSpecById(this._currentPresetSpecId);
    if (spec) {
      const { origin, projectId } = getProjectOriginAndIdFromSig(
        this._currentProjecSig,
      );
      const profileData = await ipcAgent.async.projects_loadPresetProfile(
        origin,
        projectId,
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
      _currentProjecSig: projectSig,
      _currentPresetSpecId: presetSpecId,
    } = this;
    if (!(projectSig && presetSpecId)) {
      return;
    }

    // todo: ここでProfileの名前を設定せず、新規作成未保存のProfileとして編集できるようにする

    const info = this.projectResourceModel.getProjectResourceInfo(projectSig);
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
      this.allProfileNames,
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
      this.allProfileNames,
    );
    if (checkRes !== 'ok') {
      await modalAlert(`${checkRes} operation cancelled.`);
      return;
    }

    const { origin, projectId } = getProjectOriginAndIdFromSig(projectSig);
    PresetBrowserModelHelper.createProfile(
      newProfileName,
      origin,
      projectId,
      spec,
    );
    uiStatusModel.navigateTo('editor');
  };

  private async fetchResourceInfos() {
    await this.projectResourceModel.initializeAsync();
    const resourceInfos = this.projectResourceModel.projectResourceInfos;
    if (
      resourceInfos.length > 0 &&
      !(this._currentProjecSig && this._currentPresetSpecId)
    ) {
      this._currentProjecSig = resourceInfos[0].sig;
      this._currentPresetSpecId = this.optionPresetSpecs[0]?.id;
      this.loadSelectedProfile();
    }
  }

  startPageSession = () => {
    this.fetchResourceInfos();
    return ipcAgent.subscribe('profile_profileManagerStatus', (status) => {
      if (status.allProfileNames) {
        this.allProfileNames = status.allProfileNames;
      }
    });
  };
}

export const presetBrowserModel = new PresetBrowserModel();
