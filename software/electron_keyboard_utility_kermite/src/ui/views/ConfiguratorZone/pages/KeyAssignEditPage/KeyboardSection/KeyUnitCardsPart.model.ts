import {
  IAssignOperation,
  IKeyUnitEntry,
  IAssignEntry,
  IAssignEntryWithLayerFallback
} from '~defs/ProfileData';
import { VirtualKeyTexts } from '~defs/VirtualKeyTexts';
import { editorModel, playerModel, uiStatusModel } from '~ui/models';

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
}

function getAssignOperationText(op?: IAssignOperation): string {
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
    const layer = editorModel.layers.find(
      (la) => la.layerId === op.targetLayerId
    );
    return layer?.layerName || '';
  }
  if (op?.type === 'modifierCall') {
    return VirtualKeyTexts[op.modifierKey] || '';
  }
  return '';
}

function getAssignEntryTexts(
  assign?: IAssignEntryWithLayerFallback
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
        primaryText: getAssignOperationText(assign.op),
        secondaryText: ''
      };
    }
    if (assign.type === 'dual') {
      const prmText = getAssignOperationText(assign.primaryOp);
      const secText = getAssignOperationText(assign.secondaryOp);
      const terText = getAssignOperationText(assign.tertiaryOp);
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

function getAssignForKeyUnit(keyUnitId: string, isEdit: boolean) {
  const dynamic = !isEdit || uiStatusModel.settings.showLayersDynamic;
  return dynamic
    ? playerModel.getDynamicKeyAssign(keyUnitId)
    : editorModel.getAssignForKeyUnitWithLayerFallback(keyUnitId);
}

function makeKeyUnitCardViewModel(
  kp: IKeyUnitEntry,
  isEdit: boolean
): IKeyUnitCardViewModel {
  const keyUnitId = kp.id;
  const pos = { x: kp.x, y: kp.y, r: kp.r || 0 };

  const { isKeyUnitCurrent, setCurrentKeyUnitId } = editorModel;
  const isCurrent = isKeyUnitCurrent(keyUnitId);
  const setCurrent = () => setCurrentKeyUnitId(keyUnitId);
  const assign = getAssignForKeyUnit(keyUnitId, isEdit);
  const { primaryText, secondaryText, isLayerFallback } = getAssignEntryTexts(
    assign
  );

  const isHold = playerModel.keyStates[kp.id];

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
  isEdit: boolean
): IKeyUnitCardPartViewModel {
  return {
    cards: editorModel.keyPositions.map((kp) =>
      makeKeyUnitCardViewModel(kp, isEdit)
    )
  };
}
