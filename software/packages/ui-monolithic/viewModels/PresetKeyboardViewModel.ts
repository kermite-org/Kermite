import {
  IKeyboardShapeDisplayArea,
  IProfileData
} from '~shared/defs/ProfileData';
import {
  IPresetKeyUnitViewModel,
  makePresetKeyUnitViewModels
} from '~ui/viewModels/KeyUnitCard/PresetKeyUnitViewModelCreator';
import { Hook } from '~qx';

export interface IPresetKeyboardLayerViewModel {
  layerId: string;
  layerName: string;
}

export interface IPrsetLayerListViewModel {
  layers: IPresetKeyboardLayerViewModel[];
  currentLayerId: string;
  setCurrentLayerId(layerId: string): void;
}

export interface IPresetKeyboardViewModel {
  keyUnits: IPresetKeyUnitViewModel[];
  displayArea: IKeyboardShapeDisplayArea;
  bodyPathMarkupText: string;
  layerList: IPrsetLayerListViewModel;
}

export function makePresetKeyboardViewModel(
  profileData: IProfileData
): IPresetKeyboardViewModel {
  const state = Hook.useLocal(() => ({ currentLayerId: '' }));
  Hook.useChecker(profileData, () => {
    state.currentLayerId = profileData.layers[0].layerId;
  });
  return {
    keyUnits: makePresetKeyUnitViewModels(profileData, state.currentLayerId),
    displayArea: profileData.keyboardShape.displayArea,
    bodyPathMarkupText: profileData.keyboardShape.bodyPathMarkupText,
    layerList: {
      layers: profileData.layers.map((la) => ({
        layerId: la.layerId,
        layerName: la.layerName
      })),
      currentLayerId: state.currentLayerId,
      setCurrentLayerId: (id) => (state.currentLayerId = id)
    }
  };
}
