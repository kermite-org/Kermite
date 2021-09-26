import {
  IDisplayArea,
  IDisplayOutlineShape,
  IProfileData,
  getDisplayKeyboardDesignSingleCached,
} from '~/shared';
import { IPresetKeyUnitViewModel } from '~/ui/base';
import { makePresetKeyUnitViewModels } from '~/ui/components/keyboard';

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
