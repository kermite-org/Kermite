import {
  IAssignEntry,
  IDisplayKeyboardDesign,
  IDisplayKeyEntity,
  ILayer,
} from '~/shared';
import { getAssignEntryTexts } from '~/ui-common-svg/KeyUnitCardModels/KeyUnitCardViewModelCommon';
import { IWidgetKeyUnitCardViewModel } from '~/ui-common-svg/KeyUnitCards/WidgetKeyUnitCard';
import { uiStatusModel } from '~/ui-common/sharedModels/UiStatusModel';

interface IPlayerModel {
  getDynamicKeyAssign(keyUnitId: string): IAssignEntry | undefined;
  layers: ILayer[];
  keyStates: { [keyId: string]: boolean };
  displayDesign: IDisplayKeyboardDesign;
}

export interface IWidgetKeyUnitCardsPartViewModel {
  cards: IWidgetKeyUnitCardViewModel[];
  showLayerDefaultAssign: boolean;
}

function makeWidgetKeyUnitCardViewModel(
  ke: IDisplayKeyEntity,
  playerModel: IPlayerModel,
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
  };
}

export function makeWidgetKeyUnitCardsPartViewModel(
  playerModel: IPlayerModel,
): IWidgetKeyUnitCardsPartViewModel {
  const { showLayerDefaultAssign } = uiStatusModel.settings;
  return {
    cards: playerModel.displayDesign.keyEntities.map((kp) =>
      makeWidgetKeyUnitCardViewModel(kp, playerModel),
    ),
    showLayerDefaultAssign,
  };
}
