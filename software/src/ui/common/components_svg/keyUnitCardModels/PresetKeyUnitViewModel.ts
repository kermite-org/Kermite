import {
  ILayer,
  IProfileData,
  IDisplayKeyEntity,
  IDisplayKeyboardDesign,
} from '~/shared';
import { IPresetKeyUnitViewModel } from '~/ui/common/base';
import {
  getAssignForKeyUnitWithLayerFallback,
  getAssignEntryTexts,
  getAssignForKeyUnitInInitialLayerStack,
} from '~/ui/common/components_svg/keyUnitCardModels/KeyUnitCardViewModelCommon';

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

  const assign = targetLayerId
    ? getAssignForKeyUnitWithLayerFallback(
        keyUnitId,
        targetLayerId,
        layers,
        assigns,
      )
    : getAssignForKeyUnitInInitialLayerStack(keyUnitId, layers, assigns);

  const {
    primaryText,
    secondaryText,
    tertiaryText,
    isLayerFallback,
  } = getAssignEntryTexts(assign, layers);

  return {
    keyUnitId,
    pos,
    primaryText,
    secondaryText,
    tertiaryText,
    isLayerFallback,
    shape: ke.shape,
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
