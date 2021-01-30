import {
  IAssignEntry,
  IAssignEntryWithLayerFallback,
  IDisplayKeyboardDesign,
  IDisplayKeyEntity,
  ILayer,
} from '~/shared';
import { uiStatusModel } from '~/ui-common/sharedModels/UiStatusModel';
import { getAssignEntryTexts } from '~/ui-common/sharedViewModels/KeyUnitCardViewModelCommon';
import { editorModel } from '~/ui-editor-page/EditorMainPart/models/EditorModel';

interface IPlayerModel {
  getDynamicKeyAssign(keyUnitId: string): IAssignEntry | undefined;
  layers: ILayer[];
  keyStates: { [keyId: string]: boolean };
  displayDesign: IDisplayKeyboardDesign;
}

export interface IKeyUnitCardViewModel {
  keyUnitId: string;
  pos: {
    x: number;
    y: number;
    r: number;
  };
  isCurrent: boolean;
  setCurrent: () => void;
  primaryText: string;
  secondaryText: string;
  isLayerFallback: boolean;
  isHold: boolean;
}

export interface IKeyUnitCardPartViewModel {
  cards: IKeyUnitCardViewModel[];
  showLayerDefaultAssign: boolean;
}

function getAssignForKeyUnit(
  keyUnitId: string,
  playerModel: IPlayerModel,
): IAssignEntryWithLayerFallback | undefined {
  const dynamic = uiStatusModel.settings.showLayersDynamic;
  return dynamic
    ? playerModel.getDynamicKeyAssign(keyUnitId) || {
        type: 'layerFallbackBlock',
      }
    : editorModel.getAssignForKeyUnitWithLayerFallback(keyUnitId);
}

function makeKeyUnitCardViewModel(
  ke: IDisplayKeyEntity,
  playerModel: IPlayerModel,
): IKeyUnitCardViewModel {
  const keyUnitId = ke.keyId;
  const pos = { x: ke.x, y: ke.y, r: ke.angle || 0 };

  const { isKeyUnitCurrent, setCurrentKeyUnitId } = editorModel;
  const isCurrent = isKeyUnitCurrent(keyUnitId);
  const setCurrent = () => setCurrentKeyUnitId(keyUnitId);
  const assign = getAssignForKeyUnit(keyUnitId, playerModel);
  const { primaryText, secondaryText, isLayerFallback } = getAssignEntryTexts(
    assign,
    editorModel.layers,
  );

  const isHold = playerModel.keyStates[ke.keyId];

  return {
    keyUnitId,
    pos,
    isCurrent,
    setCurrent,
    primaryText,
    secondaryText,
    isLayerFallback: isLayerFallback || false,
    isHold,
  };
}

export function makeKeyUnitCardsPartViewModel(
  playerModel: IPlayerModel,
): IKeyUnitCardPartViewModel {
  const { showLayerDefaultAssign } = uiStatusModel.settings;
  return {
    cards: editorModel.displayDesign.keyEntities.map((kp) =>
      makeKeyUnitCardViewModel(kp, playerModel),
    ),
    showLayerDefaultAssign,
  };
}
