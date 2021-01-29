import {
  ILayer,
  IProfileData,
  IDisplayKeyEntity,
  IDisplayKeyboardDesign,
} from '~/shared';
import {
  getAssignForKeyUnitWithLayerFallback,
  getAssignEntryTexts,
} from '~/ui-root/zones/common/commonViewModels/KeyUnitCard/KeyUnitCardViewModelCommon';

export interface IPresetKeyUnitViewModel {
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

function createPresetKeyUnitViewModel(
  ke: IDisplayKeyEntity,
  targetLayerId: string,
  layers: ILayer[],
  assigns: IProfileData['assigns'],
): IPresetKeyUnitViewModel {
  const keyUnitId = ke.keyId;
  const pos = {
    x: ke.x,
    y: ke.y,
    r: ke.angle || 0,
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

  return {
    keyUnitId,
    pos,
    primaryText,
    secondaryText,
    isLayerFallback,
  };
}

export function makePresetKeyUnitViewModels(
  profileData: IProfileData,
  keyboardDesign: IDisplayKeyboardDesign,
  targetLayerId: string,
): IPresetKeyUnitViewModel[] {
  const { layers, assigns } = profileData;
  return keyboardDesign.keyEntities.map((ku) => {
    return createPresetKeyUnitViewModel(ku, targetLayerId, layers, assigns);
  });
}
