import { IKeyboardShapeDisplayArea, IProfileData } from '@kermite/shared';
import { Hook } from 'qx';
import {
  IPresetKeyUnitViewModel,
  makePresetKeyUnitViewModels,
} from '~/viewModels/KeyUnitCard/PresetKeyUnitViewModelCreator';

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
  profileData: IProfileData,
): IPresetKeyboardViewModel {
  const state = Hook.useMemo(() => ({ currentLayerId: '' }), []);
  Hook.useEffect(() => {
    state.currentLayerId = profileData.layers[0].layerId;
    return true;
  }, [profileData]);
  return {
    keyUnits: makePresetKeyUnitViewModels(profileData, state.currentLayerId),
    displayArea: profileData.keyboardShape.displayArea,
    bodyPathMarkupText: profileData.keyboardShape.bodyPathMarkupText,
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
