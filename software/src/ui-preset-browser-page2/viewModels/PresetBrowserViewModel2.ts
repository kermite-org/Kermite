import { Hook } from 'qx';
import { getProjectOriginAndIdFromSig } from '~/shared/funcs/DomainRelatedHelpers';
import { ISelectorSource, useLocal } from '~/ui-common';
import { IPresetKeyboardViewModel } from '~/ui-common-svg/panels/PresetKeyboardView';
import { useDeviceStatusModel } from '~/ui-common/sharedModels/DeviceStatusModelHook';
import {
  IPresetLayerListViewModel,
  makePresetKeyboardViewModel,
} from '~/ui-preset-browser-page/viewModels/PresetKeyboardViewModel';
import { usePresetSelectionModel2 } from '~/ui-preset-browser-page2/models/PresetSelectionModel2';

export interface IPresetBrowserViewModel {
  keyboard: IPresetKeyboardViewModel;
  layerList: IPresetLayerListViewModel;
  projectSelectorSource: ISelectorSource;
  presetSelectorSource: ISelectorSource;
  isLinkButtonActive: boolean;
  linkButtonHandler(): void;
  editPresetButtonHandler(): void;
}

export function makePresetBrowserViewModel2(): IPresetBrowserViewModel {
  const deviceStatusModel = useDeviceStatusModel();
  const model = usePresetSelectionModel2();

  const { loadedProfileData: profileData } = model;

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
    projectSelectorSource: model.projectSelectorSource,
    presetSelectorSource: model.presetSelectorSource,
    isLinkButtonActive:
      deviceStatusModel.isConnected &&
      deviceStatusModel.deviceAttrs?.projectId !==
        getProjectOriginAndIdFromSig(model.currentProjectKey || '').projectId,
    linkButtonHandler() {
      const deviceProjectId = deviceStatusModel.deviceAttrs?.projectId || '';
      model.selectProjectByProjectId(deviceProjectId);
    },
    editPresetButtonHandler() {
      model.editSelectedProjectPreset();
    },
  };
}
