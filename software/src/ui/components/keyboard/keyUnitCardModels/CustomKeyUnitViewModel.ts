import { IDisplayKeyboardDesign, IProfileData } from '~/shared';
import { ICustomKeyUnitViewModelBase } from '~/ui/base';
import {
  getAssignEntryTexts,
  getAssignForKeyUnitWithLayerFallback,
} from '~/ui/components/keyboard/keyUnitCardModels/KeyUnitCardViewModelCommon';

export function makeCustomKeyUnitViewModels<
  TCustomKeyUnitViewModel extends ICustomKeyUnitViewModelBase,
>(
  profileData: IProfileData,
  keyboardDesign: IDisplayKeyboardDesign,
  targetLayerId: string,
  propsDecorator: (
    source: ICustomKeyUnitViewModelBase,
  ) => TCustomKeyUnitViewModel,
): TCustomKeyUnitViewModel[] {
  const { layers, assigns, settings } = profileData;
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
      settings,
    );

    return propsDecorator({
      keyUnitId,
      pos,
      primaryText,
      secondaryText,
      isLayerFallback,
      shape: ku.shape,
    });
  });
}
