import {
  IAssignEntry,
  IDisplayKeyboardDesign,
  IDisplayKeyEntity,
  ILayer,
} from '~/shared';
import { uiStatusModel } from '~/ui-common/sharedModels/UiStatusModel';
import { getAssignEntryTexts } from '~/ui-common/sharedViewModels/KeyUnitCardViewModelCommon';

interface IPlayerModel {
  getDynamicKeyAssign(keyUnitId: string): IAssignEntry | undefined;
  layers: ILayer[];
  keyStates: { [keyId: string]: boolean };
  displayDesign: IDisplayKeyboardDesign;
}

export interface IWidgetKeyUnitCardViewModel {
  keyUnitId: string;
  pos: {
    x: number;
    y: number;
    r: number;
  };
  primaryText: string;
  secondaryText: string;
  isLayerFallback: boolean;
  isHold: boolean;
}

export interface IWidgetKeyUnitCardPartViewModel {
  cards: IWidgetKeyUnitCardViewModel[];
  showLayerDefaultAssign: boolean;
}

function makeKeyUnitCardViewModel(
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

export function makeKeyUnitCardsPartViewModel(
  playerModel: IPlayerModel,
): IWidgetKeyUnitCardPartViewModel {
  const { showLayerDefaultAssign } = uiStatusModel.settings;
  return {
    cards: playerModel.displayDesign.keyEntities.map((kp) =>
      makeKeyUnitCardViewModel(kp, playerModel),
    ),
    showLayerDefaultAssign,
  };
}
