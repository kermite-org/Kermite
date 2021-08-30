import { IAssignEntryWithLayerFallback, IDisplayKeyEntity } from '~/shared';
import { IEditKeyUnitCardViewModel } from '~/ui/base';
import { IPlayerModel, uiStatusModel } from '~/ui/commonModels';
import { uiState } from '~/ui/commonStore';
import { getAssignEntryTexts } from '~/ui/components/keyboard';
import { EditorModel } from '~/ui/pages/editor-core/models/EditorModel';

export interface IEditKeyUnitCardPartViewModel {
  cards: IEditKeyUnitCardViewModel[];
  showLayerDefaultAssign: boolean;
}

function getAssignForKeyUnit(
  keyUnitId: string,
  playerModel: IPlayerModel,
  editorModel: EditorModel,
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
  editorModel: EditorModel,
): IEditKeyUnitCardPartViewModel {
  const { showLayerDefaultAssign } = uiState.settings;
  return {
    cards: editorModel.displayDesign.keyEntities.map((kp) =>
      makeEditKeyUnitCardViewModel(kp, playerModel, editorModel),
    ),
    showLayerDefaultAssign,
  };
}
