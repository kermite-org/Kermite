import { IAssignEntryWithLayerFallback, IDisplayKeyEntity } from '~/shared';
import { IEditKeyUnitCardViewModel } from '~/ui/base';
import { IPlayerModel } from '~/ui/commonModels';
import { getAssignEntryTexts } from '~/ui/components/keyboard';
import { AssignerModel } from '~/ui/editors/ProfileEditor/models/AssignerModel';
import { uiActions, uiState } from '~/ui/store';

export interface IEditKeyUnitCardPartViewModel {
  cards: IEditKeyUnitCardViewModel[];
  showLayerDefaultAssign: boolean;
}

function getAssignForKeyUnit(
  keyUnitId: string,
  playerModel: IPlayerModel,
  editorModel: AssignerModel,
): IAssignEntryWithLayerFallback | undefined {
  const dynamic = uiState.settings.showLayersDynamic;
  return dynamic
    ? playerModel.getDynamicKeyAssign(keyUnitId) || {
        type: 'layerFallbackBlock',
      }
    : editorModel.getAssignForKeyUnitWithLayerFallback(keyUnitId);
}

function makeEditKeyUnitCardViewModel(
  ke: IDisplayKeyEntity,
  playerModel: IPlayerModel,
  editorModel: AssignerModel,
): IEditKeyUnitCardViewModel {
  const keyUnitId = ke.keyId;
  const pos = { x: ke.x, y: ke.y, r: ke.angle || 0 };

  const { currentKeyUnitId, setCurrentKeyUnitId } = editorModel;
  const isCurrent = currentKeyUnitId === keyUnitId;
  const setCurrent = () => {
    setCurrentKeyUnitId(keyUnitId);
    uiActions.stopLiveMode();
  };
  const assign = getAssignForKeyUnit(keyUnitId, playerModel, editorModel);
  const { primaryText, secondaryText, tertiaryText, isLayerFallback } =
    getAssignEntryTexts(assign, editorModel.layers);

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
  editorModel: AssignerModel,
): IEditKeyUnitCardPartViewModel {
  const { showLayerDefaultAssign } = uiState.settings;
  return {
    cards: editorModel.displayDesign.keyEntities.map((kp) =>
      makeEditKeyUnitCardViewModel(kp, playerModel, editorModel),
    ),
    showLayerDefaultAssign,
  };
}
