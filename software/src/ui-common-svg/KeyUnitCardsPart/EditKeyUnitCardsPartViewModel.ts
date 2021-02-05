import {
  IAssignEntry,
  IAssignEntryWithLayerFallback,
  IDisplayKeyboardDesign,
  IDisplayKeyEntity,
  ILayer,
} from '~/shared';
import { getAssignEntryTexts } from '~/ui-common-svg/KeyUnitCardModels/KeyUnitCardViewModelCommon';
import { IEditKeyUnitCardViewModel } from '~/ui-common-svg/KeyUnitCards/EditKeyUnitCard';
import { uiStatusModel } from '~/ui-common/sharedModels/UiStatusModel';

export interface IPlayerModel {
  getDynamicKeyAssign(keyUnitId: string): IAssignEntry | undefined;
  layers: ILayer[];
  keyStates: { [keyId: string]: boolean };
  displayDesign: IDisplayKeyboardDesign;
}

export interface IEditorModel {
  currentKeyUnitId: string;
  setCurrentKeyUnitId(keyUnitId: string): void;
  getAssignForKeyUnitWithLayerFallback(
    keyUnitId: string,
    targetLayerId?: string,
  ): IAssignEntryWithLayerFallback | undefined;
}

export interface IEditKeyUnitCardPartViewModel {
  cards: IEditKeyUnitCardViewModel[];
  showLayerDefaultAssign: boolean;
}

function getAssignForKeyUnit(
  keyUnitId: string,
  playerModel: IPlayerModel,
  editorModel: IEditorModel,
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
  editorModel: IEditorModel,
): IEditKeyUnitCardViewModel {
  const keyUnitId = ke.keyId;
  const pos = { x: ke.x, y: ke.y, r: ke.angle || 0 };

  const { currentKeyUnitId, setCurrentKeyUnitId } = editorModel;
  const isCurrent = currentKeyUnitId === keyUnitId;
  const setCurrent = () => setCurrentKeyUnitId(keyUnitId);
  const assign = getAssignForKeyUnit(keyUnitId, playerModel, editorModel);
  const { primaryText, secondaryText, isLayerFallback } = getAssignEntryTexts(
    assign,
    playerModel.layers,
  );

  const isHold = playerModel.keyStates[ke.keyId];

  return {
    keyUnitId,
    pos,
    shape: ke.shape,
    isCurrent,
    setCurrent,
    primaryText,
    secondaryText,
    isLayerFallback: isLayerFallback || false,
    isHold,
  };
}

export function makeEditKeyUnitCardsPartViewModel(
  playerModel: IPlayerModel,
  editorModel: IEditorModel,
): IEditKeyUnitCardPartViewModel {
  const { showLayerDefaultAssign } = uiStatusModel.settings;
  return {
    cards: playerModel.displayDesign.keyEntities.map((kp) =>
      makeEditKeyUnitCardViewModel(kp, playerModel, editorModel),
    ),
    showLayerDefaultAssign,
  };
}
