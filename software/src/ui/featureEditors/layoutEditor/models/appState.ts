import { defaultKeyboardDesignSetup } from '~/shared';
import { IGridSpecKey } from '~/ui/featureEditors/layoutEditor/models/gridDefinitions';
import {
  IEditKeyboardDesign,
  IEditKeyEntity,
  IEditOutlineShape,
} from './dataSchema';

export type IEditMode = 'select' | 'move' | 'key' | 'shape' | 'delete';
export interface IEditState {
  loadedDesign: IEditKeyboardDesign;
  design: IEditKeyboardDesign;
  currentKeyEntityId: string | undefined;
  isCurrentKeyMirror: boolean;
  currentShapeId: string | undefined;
  currentPointIndex: number;
  editMode: IEditMode;
  drawingShape: IEditOutlineShape | undefined;
  currentTransGroupId: string | undefined;
}

export interface ISight {
  pos: {
    x: number;
    y: number;
  };
  scale: number;
  screenW: number;
  screenH: number;
}
export interface IEnvState {
  ghost: IEditKeyEntity | undefined;
  sight: ISight;
  showAxis: boolean;
  showGrid: boolean;
  snapToGrid: boolean;
  gridSpecKey: IGridSpecKey;
  showKeyId: boolean;
  showKeyIndex: boolean;
  pressedKeyIndices: number[];
  worldMousePos: {
    x: number;
    y: number;
  };
}

export type IEnvBoolPropKey =
  | 'showAxis'
  | 'showGrid'
  | 'snapToGrid'
  | 'showKeyId'
  | 'showKeyIndex';

interface IAppState {
  editor: IEditState;
  env: IEnvState;
}

export function createFallbackEditKeyboardDesign(): IEditKeyboardDesign {
  return {
    setup: { ...defaultKeyboardDesignSetup },
    keyEntities: {},
    outlineShapes: {},
    transGroups: {
      '0': {
        id: '0',
        x: 0,
        y: 0,
        angle: 0,
        mirror: false,
      },
    },
  };
}

export const appState: IAppState = {
  editor: {
    loadedDesign: createFallbackEditKeyboardDesign(),
    design: createFallbackEditKeyboardDesign(),
    currentKeyEntityId: undefined,
    isCurrentKeyMirror: false,
    currentShapeId: undefined,
    currentPointIndex: -1,
    editMode: 'select',
    drawingShape: undefined,
    currentTransGroupId: undefined,
  },
  env: {
    ghost: undefined,
    sight: {
      pos: {
        x: 0,
        y: 0,
      },
      scale: 0.3,
      screenW: 600,
      screenH: 400,
    },
    showAxis: true,
    showGrid: true,
    snapToGrid: true,
    gridSpecKey: 'kp_div4',
    showKeyId: true,
    showKeyIndex: true,
    pressedKeyIndices: [],
    worldMousePos: {
      x: 0,
      y: 0,
    },
  },
};
