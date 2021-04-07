import { Hook } from 'qx';
import { IProfileData } from '~/shared';
import { useLocal } from '~/ui/common';
import { IPresetKeyboardViewProps } from '~/ui/common-svg/panels/PresetKeyboardView';
import { usePresetKeyboardViewModel } from '~/ui/preset-browser-page/viewModels/PresetKeyboardViewModel';

export interface IPresetKeyboardLayerViewModel {
  layerId: string;
  layerName: string;
}
export interface IPresetLayerListViewModel {
  layers: IPresetKeyboardLayerViewModel[];
  currentLayerId: string;
  setCurrentLayerId(layerId: string): void;
}

export interface IPresetKeyboardSectionViewModel {
  keyboard: IPresetKeyboardViewProps;
  layerList: IPresetLayerListViewModel;
}

export function usePresetKeyboardSectionViewModel(
  profileData: IProfileData,
): IPresetKeyboardSectionViewModel {
  const state = useLocal({ currentLayerId: '' });
  Hook.useEffect(() => {
    state.currentLayerId = profileData.layers[0].layerId;
  }, [profileData]);
  return {
    keyboard: usePresetKeyboardViewModel(profileData, state.currentLayerId),
    layerList: {
      layers: profileData.layers.map((la) => ({
        layerId: la.layerId,
        layerName: la.layerName,
      })),
      currentLayerId: state.currentLayerId,
      setCurrentLayerId: (id) => (state.currentLayerId = id),
    },
  };
}
