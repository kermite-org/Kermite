import { IProfileData } from '~shared/defs/ProfileData';
import {
  getAssignEntryTexts,
  getAssignForKeyUnitWithLayerFallback,
} from '~ui/viewModels/KeyUnitCard/KeyUnitCardViewModelCommon';

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
  targetLayerId: string,
  propsDecolator: (
    source: ICustomKeyUnitViewModelBase,
  ) => TCustomKeyUnitViewModel,
): TCustomKeyUnitViewModel[] {
  const { layers, assigns, keyboardShape } = profileData;
  return keyboardShape.keyUnits.map((ku) => {
    const keyUnitId = ku.id;
    const pos = {
      x: ku.x,
      y: ku.y,
      r: ku.r || 0,
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
