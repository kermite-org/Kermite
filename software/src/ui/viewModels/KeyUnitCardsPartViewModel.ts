import {
  IAssignOperation,
  IKeyUnitEntry,
  IAssignEntryWithLayerFallback
} from '~defs/ProfileData';
import { VirtualKeyTexts } from '~defs/VirtualKeyTexts';
import { Models } from '~ui/models';

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

function getAssignOperationText(
  op: IAssignOperation | undefined,
  models: Models
): string {
  if (op?.type === 'keyInput') {
    const keyText = VirtualKeyTexts[op.virtualKey] || '';
    if (op.attachedModifiers) {
      const modText = op.attachedModifiers
        .map((m) => VirtualKeyTexts[m]?.charAt(0))
        .join('+');
      return `${modText}+${keyText}`;
    }
    return keyText;
  }
  if (op?.type === 'layerClearExclusive') {
    return 'ex-clear';
  }
  if (op?.type === 'layerCall') {
    const layer = models.editorModel.layers.find(
      (la) => la.layerId === op.targetLayerId
    );
    if (layer && op.invocationMode === 'turnOff') {
      return layer.layerName + '-off';
    }
    return layer?.layerName || '';
  }
  if (op?.type === 'modifierCall') {
    return VirtualKeyTexts[op.modifierKey] || '';
  }
  return '';
}

function getAssignEntryTexts(
  assign: IAssignEntryWithLayerFallback | undefined,
  models: Models
): { primaryText: string; secondaryText: string; isLayerFallback?: boolean } {
  if (assign) {
    if (assign.type === 'block' || assign.type === 'layerFallbackBlock') {
      return {
        primaryText: '□',
        // primaryTest: '⬡',
        secondaryText: '',
        isLayerFallback: assign.type === 'layerFallbackBlock'
      };
    }
    if (
      assign.type === 'transparent' ||
      assign.type === 'layerFallbackTransparent'
    ) {
      return {
        primaryText: '↡',
        secondaryText: '',
        isLayerFallback: assign.type === 'layerFallbackTransparent'
      };
    }

    if (assign.type === 'single') {
      return {
        primaryText: getAssignOperationText(assign.op, models),
        secondaryText: ''
      };
    }
    if (assign.type === 'dual') {
      const prmText = getAssignOperationText(assign.primaryOp, models);
      const secText = getAssignOperationText(assign.secondaryOp, models);
      const terText = getAssignOperationText(assign.tertiaryOp, models);
      if (assign.tertiaryOp) {
        return {
          primaryText: `${prmText} ${terText}`,
          secondaryText: secText
        };
      } else {
        return {
          primaryText: prmText,
          secondaryText: secText
        };
      }
    }
  }
  return {
    primaryText: '',
    secondaryText: ''
  };
}

function getAssignForKeyUnit(
  keyUnitId: string,
  isEdit: boolean,
  models: Models
): IAssignEntryWithLayerFallback | undefined {
  const dynamic = !isEdit || models.uiStatusModel.settings.showLayersDynamic;
  return dynamic
    ? models.playerModel.getDynamicKeyAssign(keyUnitId) || {
        type: 'layerFallbackBlock'
      }
    : models.editorModel.getAssignForKeyUnitWithLayerFallback(keyUnitId);
}

function makeKeyUnitCardViewModel(
  kp: IKeyUnitEntry,
  isEdit: boolean,
  models: Models
): IKeyUnitCardViewModel {
  const keyUnitId = kp.id;
  const pos = { x: kp.x, y: kp.y, r: kp.r || 0 };

  const { isKeyUnitCurrent, setCurrentKeyUnitId } = models.editorModel;
  const isCurrent = isKeyUnitCurrent(keyUnitId);
  const setCurrent = () => setCurrentKeyUnitId(keyUnitId);
  const assign = getAssignForKeyUnit(keyUnitId, isEdit, models);
  const { primaryText, secondaryText, isLayerFallback } = getAssignEntryTexts(
    assign,
    models
  );

  const isHold = models.playerModel.keyStates[kp.id];

  return {
    keyUnitId,
    pos,
    isCurrent,
    setCurrent,
    primaryText,
    secondaryText,
    isLayerFallback: isLayerFallback || false,
    isHold
  };
}

export function makeKeyUnitCardsPartViewModel(
  isEdit: boolean,
  models: Models
): IKeyUnitCardPartViewModel {
  const { showLayerDefaultAssign } = models.uiStatusModel.settings;
  return {
    cards: models.editorModel.keyPositions.map((kp) =>
      makeKeyUnitCardViewModel(kp, isEdit, models)
    ),
    showLayerDefaultAssign
  };
}
