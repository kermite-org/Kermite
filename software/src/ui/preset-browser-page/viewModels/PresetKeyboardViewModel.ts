import { IDisplayArea, IDisplayOutlineShape, IProfileData } from '~/shared';
import { getDisplayKeyboardDesignSingleCached } from '~/shared/modules/DisplayKeyboardSingleCache';
import {
  makePresetKeyUnitViewModels,
  IPresetKeyUnitViewModel,
} from '~/ui/common';

export interface IPresetKeyboardViewModel {
  keyUnits: IPresetKeyUnitViewModel[];
  displayArea: IDisplayArea;
  outlineShapes: IDisplayOutlineShape[];
}

export function usePresetKeyboardViewModel(
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
