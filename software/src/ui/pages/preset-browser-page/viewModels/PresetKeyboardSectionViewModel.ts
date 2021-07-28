import { useEffect, useLocal } from 'qx';
import { IProfileData } from '~/shared';
import { IPresetKeyboardViewProps } from '~/ui/common/components_svg';
import { usePresetKeyboardViewModel } from '~/ui/pages/preset-browser-page/viewModels/PresetKeyboardViewModel';

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
  useEffect(() => {
    state.currentLayerId = '';
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
