import { models } from '~ui/models';
import { ISelectorSource } from '~ui/viewModels/viewModelInterfaces';
import {
  IPresetKeyboardViewModel,
  makePresetKeyboardViewModel,
} from './PresetKeyboardViewModel';

export interface IPresetBrowserViewModel {
  keyboard: IPresetKeyboardViewModel;
  projectSelectorSource: ISelectorSource;
  presetSelectorSource: ISelectorSource;
  isLinkButtonActive: boolean;
  linkButtonHandler(): void;
  editPresetButtonHandler(): void;
}

export function makePresetBrowserViewModel(): IPresetBrowserViewModel {
  const { presetBrowserModel, deviceStatusModel } = models;
  return {
    keyboard: makePresetKeyboardViewModel(presetBrowserModel.loadedProfileData),
    projectSelectorSource: {
      options: presetBrowserModel.optionProjectInfos.map((it) => ({
        id: it.projectId,
        text: it.keyboardName,
      })),
      choiceId: presetBrowserModel.currentProjectId,
      setChoiceId: presetBrowserModel.setCurrentProjectId,
    },
    presetSelectorSource: {
      options: presetBrowserModel.optionPresetNames.map((it) => ({
        id: it,
        text: it,
      })),
      choiceId: presetBrowserModel.currentPresetName,
      setChoiceId: presetBrowserModel.setCurrentPresetName,
    },
    isLinkButtonActive:
      deviceStatusModel.isConnected &&
      deviceStatusModel.deviceAttrs?.projectId !==
        presetBrowserModel.currentProjectId,
    linkButtonHandler() {
      const deviceProjectId = deviceStatusModel.deviceAttrs?.projectId || '';
      presetBrowserModel.setCurrentProjectId(deviceProjectId);
    },
    editPresetButtonHandler() {
      presetBrowserModel.editSelectedProjectPreset();
    },
  };
}
