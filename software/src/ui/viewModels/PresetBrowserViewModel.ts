import { Models } from '~ui/models';
import { PresetBrowserModel } from '~ui/models/PresetBrowserModel';
import { ISelectorSource } from '~ui/viewModels/viewModelInterfaces';
import {
  IPresetKeyboardViewModel,
  PresetKeyboardViewModel
} from './PresetKeyboardViewModel';

export interface IPresetBrowserViewModel {
  keyboard: IPresetKeyboardViewModel;
  projectSelectorSource: ISelectorSource;
  presetSelectorSource: ISelectorSource;
  isLinkButtonActive: boolean;
  linkButtonHandler(): void;
  editPresetButtonHandler(): void;
}

export class PresetBrowserViewModel implements IPresetBrowserViewModel {
  private _keyboard = new PresetKeyboardViewModel();

  constructor(private models: Models) {}

  private get model(): PresetBrowserModel {
    return this.models.presetBrowserModel;
  }

  get keyboard() {
    this._keyboard.updateProfileData(this.model.loadedProfileData);
    return this._keyboard;
  }

  get projectSelectorSource() {
    return {
      options: this.model.optionProjectInfos.map((info) => ({
        id: info.projectId,
        text: info.projectName
      })),
      choiceId: this.model.currentProjectId,
      setChoiceId: this.model.setCurrentProjectId
    };
  }

  get presetSelectorSource() {
    return {
      options: this.model.optionPresetNames.map((it) => ({ id: it, text: it })),
      choiceId: this.model.currentPresetName,
      setChoiceId: this.model.setCurrentPresetName
    };
  }

  get isLinkButtonActive() {
    return (
      this.models.deviceStatusModel.isConnected &&
      this.models.deviceStatusModel.deviceAttrs?.projectId !==
        this.model.currentProjectId
    );
  }

  linkButtonHandler = () => {
    const deviceProjectId =
      this.models.deviceStatusModel.deviceAttrs?.projectId || '';
    this.projectSelectorSource.setChoiceId(deviceProjectId);
  };

  editPresetButtonHandler = () => {
    this.model.editSelectedProjectPreset();
  };
}
