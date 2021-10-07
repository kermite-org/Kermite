import { IDisplayKeyEntity } from '~/shared';
import { IWidgetKeyUnitCardViewModel } from '~/ui/base';
import { IPlayerModel } from '~/ui/commonModels';
import { getAssignEntryTexts } from '~/ui/components/keyboard';

export function useWidgetKeyUnitCardViewModel(
  ke: IDisplayKeyEntity,
  playerModel: IPlayerModel,
): IWidgetKeyUnitCardViewModel {
  const keyUnitId = ke.keyId;
  const pos = { x: ke.x, y: ke.y, r: ke.angle || 0 };
  const assign = playerModel.getDynamicKeyAssign(keyUnitId) || {
    type: 'layerFallbackBlock',
  };
  const { primaryText, secondaryText, tertiaryText, isLayerFallback } =
    getAssignEntryTexts(
      assign,
      playerModel.layers,
      playerModel.profileSettings,
    );

  const isHold = playerModel.keyStates[ke.keyId];

  return {
    keyUnitId,
    pos,
    primaryText,
    secondaryText,
    tertiaryText,
    isLayerFallback: isLayerFallback || false,
    isHold,
    shape: ke.shape,
    shiftHold: playerModel.shiftHold,
  };
}
