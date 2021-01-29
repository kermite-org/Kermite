import { IDisplayKeyboardDesign, IProfileData } from '~/shared';
import {
  getAssignForKeyUnitWithLayerFallback,
  getAssignEntryTexts,
} from '~/ui-common/viewModels/KeyUnitCardViewModelCommon';

export interface ICustomKeyUnitViewModelBase {
  keyUnitId: string;
  pos: {
    x: number;
    y: number;
    r: number;
  };
  primaryText: string;
  secondaryText: string;
  isLayerFallback: boolean;
}

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
    });
  });
}
