import {
  IAssignOperation,
  IKeyUnitPositionEntry,
  ISingleAssignEntry,
} from '~defs/ProfileData';
import { VirtualKeyTexts } from '~defs/VirtualKeyTexts';
import { editorModule } from '~models/core/EditorModule';

export interface IKeyUnitCardModel {
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
}

function getAssignOperationText(op?: IAssignOperation): string {
  if (op?.type === 'keyInput' && op.virtualKey !== 'K_NONE') {
    return VirtualKeyTexts[op.virtualKey] || '';
  }
  if (op?.type === 'layerCall') {
    const layer = editorModule.layers.find(
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
  assign?: ISingleAssignEntry
): { primaryText: string; secondaryText: string } {
  if (assign) {
    if (assign.type === 'transparent') {
      return {
        primaryText: 'TR',
        secondaryText: '',
      };
    }
    // if (assign.type === 'single1' && assign.op) {
    //   return {
    //     primaryText: getAssignOperationText(assign.op),
    //     secondaryText: ''
    //   };
    // }
    if (assign.type === 'single2') {
      return {
        primaryText: getAssignOperationText(assign.primaryOp),
        secondaryText:
          assign.mode === 'dual'
            ? getAssignOperationText(assign.secondaryOp)
            : '',
      };
    }
  }
  return {
    primaryText: '',
    secondaryText: '',
  };
}

export function makeKeyUnitCardModel(
  kp: IKeyUnitPositionEntry
): IKeyUnitCardModel {
  const keyUnitId = kp.id;
  const pos = { x: kp.x, y: kp.y, r: kp.r };

  const {
    isKeyUnitCurrent,
    setCurrentKeyUnitId,
    getAssignForKeyUnit,
  } = editorModule;

  const isCurrent = isKeyUnitCurrent(keyUnitId);
  const setCurrent = () => {
    setCurrentKeyUnitId(keyUnitId);
  };
  const assign = getAssignForKeyUnit(keyUnitId);
  const { primaryText, secondaryText } = getAssignEntryTexts(assign);

  return {
    keyUnitId,
    pos,
    isCurrent,
    setCurrent,
    primaryText,
    secondaryText,
  };
}
