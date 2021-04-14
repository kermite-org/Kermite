import { IDisplayKeyEntity } from '~/shared';
import { PlayerModel } from '~/ui/common';
import { getAssignEntryTexts } from '~/ui/common-svg/keyUnitCardModels/KeyUnitCardViewModelCommon';
import { IWidgetKeyUnitCardViewModel } from '~/ui/common-svg/keyUnitCards/WidgetKeyUnitCard';

export function useWidgetKeyUnitCardViewModel(
  ke: IDisplayKeyEntity,
  playerModel: PlayerModel,
): IWidgetKeyUnitCardViewModel {
  const keyUnitId = ke.keyId;
  const pos = { x: ke.x, y: ke.y, r: ke.angle || 0 };
  const assign = playerModel.getDynamicKeyAssign(keyUnitId) || {
    type: 'layerFallbackBlock',
  };
  const { primaryText, secondaryText, isLayerFallback } = getAssignEntryTexts(
    assign,
    playerModel.layers,
  );

  const isHold = playerModel.keyStates[ke.keyId];

  return {
    keyUnitId,
    pos,
    primaryText,
    secondaryText,
    isLayerFallback: isLayerFallback || false,
    isHold,
    shape: ke.shape,
    shiftHold: playerModel.checkShiftHold(),
  };
}
