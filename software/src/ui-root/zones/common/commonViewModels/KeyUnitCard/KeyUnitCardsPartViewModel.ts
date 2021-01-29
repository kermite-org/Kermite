import { IAssignEntryWithLayerFallback, IDisplayKeyEntity } from '~/shared';
import { uiStatusModel } from '~/ui-common/sharedModels/UiStatusModel';
import { getAssignEntryTexts } from '~/ui-common/sharedViewModels/KeyUnitCardViewModelCommon';
import { playerModel } from '~/ui-root/zones/common/commonModels/PlayerModel';
import { editorModel } from '~/ui-root/zones/editor/models/EditorModel';

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
  isEdit: boolean,
): IAssignEntryWithLayerFallback | undefined {
  const dynamic = !isEdit || uiStatusModel.settings.showLayersDynamic;
  return dynamic
    ? playerModel.getDynamicKeyAssign(keyUnitId) || {
        type: 'layerFallbackBlock',
      }
    : editorModel.getAssignForKeyUnitWithLayerFallback(keyUnitId);
}

function makeKeyUnitCardViewModel(
  ke: IDisplayKeyEntity,
  isEdit: boolean,
): IKeyUnitCardViewModel {
  const keyUnitId = ke.keyId;
  const pos = { x: ke.x, y: ke.y, r: ke.angle || 0 };

  const { isKeyUnitCurrent, setCurrentKeyUnitId } = editorModel;
  const isCurrent = isKeyUnitCurrent(keyUnitId);
  const setCurrent = () => setCurrentKeyUnitId(keyUnitId);
  const assign = getAssignForKeyUnit(keyUnitId, isEdit);
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
  isEdit: boolean,
): IKeyUnitCardPartViewModel {
  const { showLayerDefaultAssign } = uiStatusModel.settings;
  return {
    cards: editorModel.displayDesign.keyEntities.map((kp) =>
      makeKeyUnitCardViewModel(kp, isEdit),
    ),
    showLayerDefaultAssign,
  };
}
