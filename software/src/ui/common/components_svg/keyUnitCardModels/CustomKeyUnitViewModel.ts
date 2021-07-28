import { IDisplayKeyboardDesign, IProfileData } from '~/shared';
import { ICustomKeyUnitViewModelBase } from '~/ui/common/base';
import {
  getAssignEntryTexts,
  getAssignForKeyUnitWithLayerFallback,
} from '~/ui/common/components_svg/keyUnitCardModels/KeyUnitCardViewModelCommon';

export function makeCustomKeyUnitViewModels<
  TCustomKeyUnitViewModel extends ICustomKeyUnitViewModelBase
>(
  profileData: IProfileData,
  keyboardDesign: IDisplayKeyboardDesign,
  targetLayerId: string,
  propsDecolator: (
    source: ICustomKeyUnitViewModelBase,
  ) => TCustomKeyUnitViewModel,
): TCustomKeyUnitViewModel[] {
  const { layers, assigns } = profileData;
  return keyboardDesign.keyEntities.map((ku) => {
    const keyUnitId = ku.keyId;
    const pos = {
      x: ku.x,
      y: ku.y,
      r: ku.angle || 0,
    };

    const assign = getAssignForKeyUnitWithLayerFallback(
      keyUnitId,
      targetLayerId,
      layers,
      assigns,
    );

    const { primaryText, secondaryText, isLayerFallback } = getAssignEntryTexts(
      assign,
      layers,
    );

    return propsDecolator({
      keyUnitId,
      pos,
      primaryText,
      secondaryText,
      isLayerFallback,
      shape: ku.shape,
    });
  });
}
