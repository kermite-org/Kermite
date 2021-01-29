import { models } from '~/ui-root/zones/common/commonModels';
import { ISelectorSource } from '~/ui-root/zones/common/commonViewModels/viewModelInterfaces';
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
      choiceId: presetBrowserModel.currentProjectId || '',
      setChoiceId: presetBrowserModel.setCurrentProjectId,
    },
    presetSelectorSource: {
      options: presetBrowserModel.optionPresetSpecs.map((it) => ({
        id: it.id,
        text:
          it.type === 'preset'
            ? `[preset]${it.presetName}`
            : `[blank]${it.layoutName}`,
      })),
      choiceId: presetBrowserModel.currentPresetSpecId || '',
      setChoiceId: presetBrowserModel.setCurrentPresetSpecId,
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
