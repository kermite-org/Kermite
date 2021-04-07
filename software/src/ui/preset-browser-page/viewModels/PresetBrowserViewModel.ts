import { Hook } from 'qx';
import { getProjectOriginAndIdFromSig } from '~/shared/funcs/DomainRelatedHelpers';
import { ISelectorSource, useLocal } from '~/ui/common';
import { IPresetKeyboardViewModel } from '~/ui/common-svg/panels/PresetKeyboardView';
import { useDeviceStatusModel } from '~/ui/common/sharedModels/DeviceStatusModelHook';
import { usePresetSelectionModel } from '~/ui/preset-browser-page/models/PresetSelectionModel';
import { editSelectedProjectPreset } from '~/ui/preset-browser-page/models/ProfileCreator';
import { useProfileDataLoaded } from '~/ui/preset-browser-page/models/ProfileDataLoader';
import {
  IPresetLayerListViewModel,
  makePresetKeyboardViewModel,
} from './PresetKeyboardViewModel';

export interface IPresetBrowserViewModel {
  keyboard: IPresetKeyboardViewModel;
  layerList: IPresetLayerListViewModel;
  projectSelectorSource: ISelectorSource;
  presetSelectorSource: ISelectorSource;
  isLinkButtonActive: boolean;
  linkButtonHandler(): void;
  editPresetButtonHandler(): void;
}

export function makePresetBrowserViewModel(): IPresetBrowserViewModel {
  const deviceStatusModel = useDeviceStatusModel();
  const model = usePresetSelectionModel();

  const profileData = useProfileDataLoaded(
    model.currentProjectKey,
    model.currentPresetKey,
  );

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
      editSelectedProjectPreset(
        model.currentProjectKey,
        model.currentPresetKey,
      );
    },
  };
}
