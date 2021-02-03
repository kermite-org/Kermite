import { IProfileData } from '~/shared';
import { makePresetKeyUnitViewModels } from '~/ui-common-svg/KeyUnitCardModels/PresetKeyUnitViewModel';
import { IPresetKeyboardViewModel } from '~/ui-common-svg/panels/PresetKeyboardView';
import { getDisplayKeyboardDesignSingleCached } from '~/ui-common/modules/DisplayKeyboardSingleCache';

export interface IPresetKeyboardLayerViewModel {
  layerId: string;
  layerName: string;
}

export interface IPrsetLayerListViewModel {
  layers: IPresetKeyboardLayerViewModel[];
  currentLayerId: string;
  setCurrentLayerId(layerId: string): void;
}

export function makePresetKeyboardViewModel(
  profileData: IProfileData,
  currentLayerId: string,
): IPresetKeyboardViewModel {
  const displayDesign = getDisplayKeyboardDesignSingleCached(
    profileData.keyboardDesign,
  );
  return {
    keyUnits: makePresetKeyUnitViewModels(
      profileData,
      displayDesign,
      currentLayerId,
    ),
    displayArea: displayDesign.displayArea,
    outlineShapes: displayDesign.outlineShapes,
  };
}
