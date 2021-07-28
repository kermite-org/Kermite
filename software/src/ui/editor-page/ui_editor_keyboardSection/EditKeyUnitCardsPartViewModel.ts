import { IAssignEntryWithLayerFallback, IDisplayKeyEntity } from '~/shared';
import {
  IPlayerModel,
  uiStatusModel,
  getAssignEntryTexts,
  IEditKeyUnitCardViewModel,
} from '~/ui/common';
import { EditorModel } from '~/ui/editor-page/models/EditorModel';

export interface IEditKeyUnitCardPartViewModel {
  cards: IEditKeyUnitCardViewModel[];
  showLayerDefaultAssign: boolean;
}

function getAssignForKeyUnit(
  keyUnitId: string,
  playerModel: IPlayerModel,
  editorModel: EditorModel,
): IAssignEntryWithLayerFallback | undefined {
  const dynamic = uiStatusModel.settings.showLayersDynamic;
  return dynamic
    ? playerModel.getDynamicKeyAssign(keyUnitId) || {
        type: 'layerFallbackBlock',
      }
    : editorModel.getAssignForKeyUnitWithLayerFallback(keyUnitId);
}

function makeEditKeyUnitCardViewModel(
  ke: IDisplayKeyEntity,
  playerModel: IPlayerModel,
  editorModel: EditorModel,
): IEditKeyUnitCardViewModel {
  const keyUnitId = ke.keyId;
  const pos = { x: ke.x, y: ke.y, r: ke.angle || 0 };

  const { currentKeyUnitId, setCurrentKeyUnitId } = editorModel;
  const isCurrent = currentKeyUnitId === keyUnitId;
  const setCurrent = () => {
    setCurrentKeyUnitId(keyUnitId);
    uiStatusModel.stopLiveMode();
  };
  const assign = getAssignForKeyUnit(keyUnitId, playerModel, editorModel);
  const {
    primaryText,
    secondaryText,
    tertiaryText,
    isLayerFallback,
  } = getAssignEntryTexts(assign, editorModel.layers);

  const dynamic = uiStatusModel.settings.showLayersDynamic;
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
  editorModel: EditorModel,
): IEditKeyUnitCardPartViewModel {
  const { showLayerDefaultAssign } = uiStatusModel.settings;
  return {
    cards: editorModel.displayDesign.keyEntities.map((kp) =>
      makeEditKeyUnitCardViewModel(kp, playerModel, editorModel),
    ),
    showLayerDefaultAssign,
  };
}
