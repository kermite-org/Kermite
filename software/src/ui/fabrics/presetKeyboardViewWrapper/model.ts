import {
  getDisplayKeyboardDesignSingleCached,
  IDisplayArea,
  IDisplayExtraShape,
  IDisplayOutlineShape,
  IProfileData,
} from '~/shared';
import { IPresetKeyUnitViewModel } from '~/ui/base';
import { makePresetKeyUnitViewModels } from '~/ui/elements/keyboard';

export interface IPresetKeyboardViewWrapperModel {
  keyUnits: IPresetKeyUnitViewModel[];
  displayArea: IDisplayArea;
  outlineShapes: IDisplayOutlineShape[];
  extraShapes: IDisplayExtraShape[];
}

export function usePresetKeyboardViewWrapperModel(
  profileData: IProfileData,
): IPresetKeyboardViewWrapperModel {
  const displayDesign = getDisplayKeyboardDesignSingleCached(
    profileData.keyboardDesign,
  );
  return {
    keyUnits: makePresetKeyUnitViewModels(profileData, displayDesign, ''),
    displayArea: displayDesign.displayArea,
    outlineShapes: displayDesign.outlineShapes,
    extraShapes: displayDesign.extraShapes,
  };
}
