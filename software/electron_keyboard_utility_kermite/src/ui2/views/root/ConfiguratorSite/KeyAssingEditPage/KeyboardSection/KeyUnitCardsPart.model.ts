import {
  IAssignOperation,
  IKeyUnitEntry,
  IAssignEntry
} from '~defs/ProfileData';
import { VirtualKeyTexts } from '~defs/VirtualKeyTexts';
import { editorModel, appDomain } from '~ui2/models/zAppDomain';

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
  if (op?.type === 'layerCall') {
    const layer = editorModel.layers.find(
      (la) => la.layerId === op.targetLayerId
    );
    return (layer && layer.layerName) || '';
  }
  if (op?.type === 'modifierCall') {
    return VirtualKeyTexts[op.modifierKey] || '';
  }
  return '';
}

function getAssignEntryTexts(
  assign?: IAssignEntry
): { primaryText: string; secondaryText: string } {
  if (assign) {
    // if (assign.type === 'transparent') {
    //   return {
    //     primaryText: 'TR',
    //     secondaryText: ''
    //   };
    // }
    // if (assign.type === 'single1' && assign.op) {
    //   return {
    //     primaryText: getAssignOperationText(assign.op),
    //     secondaryText: ''
    //   };
    // }

    if (assign.type === 'single') {
      return {
        primaryText: getAssignOperationText(assign.op),
        secondaryText: ''
      };
    }
    // if (assign.type === 'single2') {
    //   return {
    //     primaryText: getAssignOperationText(assign.primaryOp),
    //     secondaryText:
    //       assign.mode === 'dual'
    //         ? getAssignOperationText(assign.secondaryOp)
    //         : ''
    //   };
    // }
  }
  return {
    primaryText: '',
    secondaryText: ''
  };
}

function makeKeyUnitCardViewModel(kp: IKeyUnitEntry): IKeyUnitCardViewModel {
  const keyUnitId = kp.id;
  const pos = { x: kp.x, y: kp.y, r: kp.r };

  const {
    isKeyUnitCurrent,
    setCurrentKeyUnitId,
    getAssignForKeyUnit
  } = editorModel;

  const isCurrent = isKeyUnitCurrent(keyUnitId);
  const setCurrent = () => setCurrentKeyUnitId(keyUnitId);

  const assign = getAssignForKeyUnit(keyUnitId);
  const { primaryText, secondaryText } = getAssignEntryTexts(assign);

  const isHold = appDomain.playerModel.keyStates[kp.id];

  return {
    keyUnitId,
    pos,
    isCurrent,
    setCurrent,
    primaryText,
    secondaryText,
    isHold
  };
}

export function makeKeyUnitCardsPartViewModel(): IKeyUnitCardPartViewModel {
  return {
    cards: editorModel.keyPositions.map(makeKeyUnitCardViewModel)
  };
}
