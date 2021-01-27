import { IAssignEntryWithLayerFallback, IDisplayKeyEntity } from '~/shared';
import { Models } from '~/ui-root/models';
import { getAssignEntryTexts } from '~/ui-root/viewModels/KeyUnitCard/KeyUnitCardViewModelCommon';

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
  models: Models,
): IAssignEntryWithLayerFallback | undefined {
  const dynamic = !isEdit || models.uiStatusModel.settings.showLayersDynamic;
  return dynamic
    ? models.playerModel.getDynamicKeyAssign(keyUnitId) || {
        type: 'layerFallbackBlock',
      }
    : models.editorModel.getAssignForKeyUnitWithLayerFallback(keyUnitId);
}

function makeKeyUnitCardViewModel(
  ke: IDisplayKeyEntity,
  isEdit: boolean,
  models: Models,
): IKeyUnitCardViewModel {
  const keyUnitId = ke.keyId;
  const pos = { x: ke.x, y: ke.y, r: ke.angle || 0 };

  const { isKeyUnitCurrent, setCurrentKeyUnitId } = models.editorModel;
  const isCurrent = isKeyUnitCurrent(keyUnitId);
  const setCurrent = () => setCurrentKeyUnitId(keyUnitId);
  const assign = getAssignForKeyUnit(keyUnitId, isEdit, models);
  const { primaryText, secondaryText, isLayerFallback } = getAssignEntryTexts(
    assign,
    models.editorModel.layers,
  );

  const isHold = models.playerModel.keyStates[ke.keyId];

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
  models: Models,
): IKeyUnitCardPartViewModel {
  const { showLayerDefaultAssign } = models.uiStatusModel.settings;
  return {
    cards: models.editorModel.displayDesign.keyEntities.map((kp) =>
      makeKeyUnitCardViewModel(kp, isEdit, models),
    ),
    showLayerDefaultAssign,
  };
}
