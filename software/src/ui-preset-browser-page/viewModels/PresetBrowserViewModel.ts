import { Hook } from 'qx';
import { getProjectOriginAndIdFromSig } from '~/shared/funcs/DomainRelatedHelpers';
import { ISelectorSource, useLocal } from '~/ui-common';
import { IPresetKeyboardViewModel } from '~/ui-common-svg/panels/PresetKeyboardView';
import { useDeviceStatusModel } from '~/ui-common/sharedModels/DeviceStatusModelHook';
import { presetBrowserModel } from '~/ui-preset-browser-page/models/PresetBrowserModel';
import {
  IPrsetLayerListViewModel,
  makePresetKeyboardViewModel,
} from './PresetKeyboardViewModel';

export interface IPresetBrowserViewModel {
  keyboard: IPresetKeyboardViewModel;
  layerList: IPrsetLayerListViewModel;
  projectSelectorSource: ISelectorSource;
  presetSelectorSource: ISelectorSource;
  isLinkButtonActive: boolean;
  linkButtonHandler(): void;
  editPresetButtonHandler(): void;
}

export function makePresetBrowserViewModel(): IPresetBrowserViewModel {
  const deviceStatusModel = useDeviceStatusModel();
  const profileData = presetBrowserModel.loadedProfileData;

  const state = useLocal({ currentLayerId: '' });
  Hook.useEffect(() => {
    state.currentLayerId = profileData.layers[0].layerId;
  }, [profileData]);

  return {
    keyboard: makePresetKeyboardViewModel(profileData, state.currentLayerId),
    layerList: {
      layers: profileData.layers.map((la) => ({
        layerId: la.layerId,
        layerName: la.layerName,
      })),
      currentLayerId: state.currentLayerId,
      setCurrentLayerId: (id) => (state.currentLayerId = id),
    },
    projectSelectorSource: {
      options: presetBrowserModel.optionProjectInfos.map((it) => ({
        id: it.sig,
        text: (it.origin === 'local' ? '[L]' : '[R]') + it.keyboardName,
      })),
      choiceId: presetBrowserModel.currentProjectSig || '',
      setChoiceId: presetBrowserModel.setCurrentProjectSig,
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
        getProjectOriginAndIdFromSig(presetBrowserModel.currentProjectSig || '')
          .projectId,
    linkButtonHandler() {
      const deviceProjectId = deviceStatusModel.deviceAttrs?.projectId || '';
      presetBrowserModel.setCurrentProjectByProjectId(deviceProjectId);
    },
    editPresetButtonHandler() {
      presetBrowserModel.editSelectedProjectPreset();
    },
  };
}
