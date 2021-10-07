import { IAssignEntryWithLayerFallback, IDisplayKeyEntity } from '~/shared';
import { IEditKeyUnitCardViewModel } from '~/ui/base';
import { IPlayerModel } from '~/ui/commonModels';
import { getAssignEntryTexts } from '~/ui/components/keyboard';
import { assignerModel } from '~/ui/editors/ProfileEditor/models/AssignerModel';
import { uiActions, uiState } from '~/ui/store';

export interface IEditKeyUnitCardPartViewModel {
  cards: IEditKeyUnitCardViewModel[];
  showLayerDefaultAssign: boolean;
}

function getAssignForKeyUnit(
  keyUnitId: string,
  playerModel: IPlayerModel,
): IAssignEntryWithLayerFallback | undefined {
  const dynamic = uiState.settings.showLayersDynamic;
  return dynamic
    ? playerModel.getDynamicKeyAssign(keyUnitId) || {
        type: 'layerFallbackBlock',
      }
    : assignerModel.getAssignForKeyUnitWithLayerFallback(keyUnitId);
}

function makeEditKeyUnitCardViewModel(
  ke: IDisplayKeyEntity,
  playerModel: IPlayerModel,
): IEditKeyUnitCardViewModel {
  const keyUnitId = ke.keyId;
  const pos = { x: ke.x, y: ke.y, r: ke.angle || 0 };

  const {
    currentKeyUnitId,
    setCurrentKeyUnitId,
    profileData: { settings },
  } = assignerModel;
  const isCurrent = currentKeyUnitId === keyUnitId;
  const setCurrent = () => {
    setCurrentKeyUnitId(keyUnitId);
    uiActions.stopLiveMode();
  };
  const assign = getAssignForKeyUnit(keyUnitId, playerModel);
  const { primaryText, secondaryText, tertiaryText, isLayerFallback } =
    getAssignEntryTexts(assign, assignerModel.layers, settings);

  const dynamic = uiState.settings.showLayersDynamic;
  const isHold = (dynamic && playerModel.keyStates[ke.keyId]) || false;
  const shiftHold = dynamic && playerModel.shiftHold;

  return {
    keyUnitId,
    pos,
    shape: ke.shape,
    isCurrent,
    setCurrent,
    primaryText,
    secondaryText,
    tertiaryText,
    isLayerFallback: isLayerFallback || false,
    isHold,
    shiftHold,
  };
}

export function makeEditKeyUnitCardsPartViewModel(
  playerModel: IPlayerModel,
): IEditKeyUnitCardPartViewModel {
  const { showLayerDefaultAssign } = uiState.settings;
  return {
    cards: assignerModel.displayDesign.keyEntities.map((kp) =>
      makeEditKeyUnitCardViewModel(kp, playerModel),
    ),
    showLayerDefaultAssign,
  };
}
