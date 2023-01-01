import {
  IAssignEntryWithLayerFallback,
  IDisplayKeyEntity,
  IEditKeyUnitCardViewModel,
} from '~/app-shared';
import { getAssignEntryTexts } from '~/fe-shared';
import { profileEditorStore } from '../../store';
import { assignerModel } from '../models';

type IPlayerModelPartial = {
  keyStates: Record<string, boolean>;
  shiftHold: boolean;
  getDynamicKeyAssign(
    keyUnitId: string,
  ): IAssignEntryWithLayerFallback | undefined;
};

export interface IEditKeyUnitCardPartViewModel {
  cards: IEditKeyUnitCardViewModel[];
  showLayerDefaultAssign: boolean;
}

function getAssignForKeyUnit(
  keyUnitId: string,
  playerModel: IPlayerModelPartial,
): IAssignEntryWithLayerFallback | undefined {
  const { showLayersDynamic } = profileEditorStore.readers;
  return showLayersDynamic
    ? playerModel.getDynamicKeyAssign(keyUnitId) || {
        type: 'layerFallbackBlock',
      }
    : assignerModel.getAssignForKeyUnitWithLayerFallback(keyUnitId);
}

function makeEditKeyUnitCardViewModel(
  ke: IDisplayKeyEntity,
  playerModel: IPlayerModelPartial,
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
    profileEditorStore.actions.stopLiveMode();
  };
  const assign = getAssignForKeyUnit(keyUnitId, playerModel);
  const { primaryText, secondaryText, tertiaryText, isLayerFallback } =
    getAssignEntryTexts(assign, assignerModel.layers, settings);

  const { showLayersDynamic } = profileEditorStore.readers;
  // const isHold = (dynamic && playerModel.keyStates[ke.keyId]) || false;
  const isHold = playerModel.keyStates[ke.keyId] || false;
  const shiftHold = showLayersDynamic && playerModel.shiftHold;

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
  playerModel: IPlayerModelPartial,
): IEditKeyUnitCardPartViewModel {
  const { showLayerDefaultAssign } = profileEditorStore.readers;
  return {
    cards: assignerModel.displayDesign.keyEntities.map((kp) =>
      makeEditKeyUnitCardViewModel(kp, playerModel),
    ),
    showLayerDefaultAssign,
  };
}
