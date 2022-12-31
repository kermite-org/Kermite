import {
  IAssignEntryWithLayerFallback,
  IDisplayKeyEntity,
  IEditKeyUnitCardViewModel,
} from '~/app-shared';
import { getAssignEntryTexts } from '~/fe-shared';
import { profileEditorConfig } from '../adapters';
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
  const dynamic = profileEditorConfig.settings.showLayersDynamic;
  return dynamic
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
    profileEditorConfig.stopLiveMode();
  };
  const assign = getAssignForKeyUnit(keyUnitId, playerModel);
  const { primaryText, secondaryText, tertiaryText, isLayerFallback } =
    getAssignEntryTexts(assign, assignerModel.layers, settings);

  const dynamic = profileEditorConfig.settings.showLayersDynamic;
  // const isHold = (dynamic && playerModel.keyStates[ke.keyId]) || false;
  const isHold = playerModel.keyStates[ke.keyId] || false;
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
  playerModel: IPlayerModelPartial,
): IEditKeyUnitCardPartViewModel {
  const { showLayerDefaultAssign } = profileEditorConfig.settings;
  return {
    cards: assignerModel.displayDesign.keyEntities.map((kp) =>
      makeEditKeyUnitCardViewModel(kp, playerModel),
    ),
    showLayerDefaultAssign,
  };
}
