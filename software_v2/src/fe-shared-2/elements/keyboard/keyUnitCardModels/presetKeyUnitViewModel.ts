import {
  ILayer,
  IProfileData,
  IDisplayKeyEntity,
  IDisplayKeyboardLayout,
  IProfileSettings,
} from '~/app-shared';
import { IPresetKeyUnitViewModel } from '~/fe-shared';
import {
  getAssignForKeyUnitWithLayerFallback,
  getAssignEntryTexts,
  getAssignForKeyUnitInInitialLayerStack,
} from './keyUnitCardViewModelCommon';

function createPresetKeyUnitViewModel(
  ke: IDisplayKeyEntity,
  targetLayerId: string,
  layers: ILayer[],
  assigns: IProfileData['assigns'],
  settings: IProfileSettings,
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

  const { primaryText, secondaryText, tertiaryText, isLayerFallback } =
    getAssignEntryTexts(assign, layers, settings);

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
  keyboardDesign: IDisplayKeyboardLayout,
  targetLayerId: string,
): IPresetKeyUnitViewModel[] {
  const { layers, assigns, settings } = profileData;
  return keyboardDesign.keyEntities.map((ku) => {
    return createPresetKeyUnitViewModel(
      ku,
      targetLayerId,
      layers,
      assigns,
      settings,
    );
  });
}
