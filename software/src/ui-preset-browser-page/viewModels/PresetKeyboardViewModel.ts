import { Hook } from 'qx';
import { IDisplayArea, IDisplayOutlineShape, IProfileData } from '~/shared';
import { getDisplayKeyboardDesignSingleCached } from '~/ui-common/modules/DisplayKeyboardSingleCache';
import {
  IPresetKeyUnitViewModel,
  makePresetKeyUnitViewModels,
} from '~/ui-preset-browser-page/viewModels/PresetKeyUnitViewModelCreator';

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
  displayArea: IDisplayArea;
  outlineShapes: IDisplayOutlineShape[];
  layerList: IPrsetLayerListViewModel;
}

export function makePresetKeyboardViewModel(
  profileData: IProfileData,
): IPresetKeyboardViewModel {
  const state = Hook.useMemo(() => ({ currentLayerId: '' }), []);
  Hook.useEffect(() => {
    state.currentLayerId = profileData.layers[0].layerId;
  }, [profileData]);

  const displayDesign = getDisplayKeyboardDesignSingleCached(
    profileData.keyboardDesign,
  );
  return {
    keyUnits: makePresetKeyUnitViewModels(
      profileData,
      displayDesign,
      state.currentLayerId,
    ),
    displayArea: displayDesign.displayArea,
    outlineShapes: displayDesign.outlineShapes,
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
