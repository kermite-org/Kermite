import {
  IDisplayArea,
  IDisplayOutlineShape,
  IProfileData,
  getDisplayKeyboardDesignSingleCached,
  IExtraShapeDefinition,
} from '~/shared';
import { IPresetKeyUnitViewModel } from '~/ui/base';
import { makePresetKeyUnitViewModels } from '~/ui/elements/keyboard';

export interface IPresetKeyboardViewWrapperModel {
  keyUnits: IPresetKeyUnitViewModel[];
  displayArea: IDisplayArea;
  outlineShapes: IDisplayOutlineShape[];
  extraShape: IExtraShapeDefinition | undefined;
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
    extraShape: displayDesign.extraShape,
  };
}
