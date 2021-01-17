import { IEditKeyboardDesign, IEditKeyEntity } from './DataSchema';

export type IEditorTarget = 'key' | 'outline';
export type IEditMode = 'select' | 'add' | 'move' | 'delete';

export interface IModeState {
  editMode: IEditMode;
  editorTarget: IEditorTarget;
}
export interface IEditState {
  design: IEditKeyboardDesign;
  currentkeyEntityId: string | undefined;
  isCurrentKeyMirror: boolean;
  currentShapeId: string | undefined;
  currentPointIndex: number;
  editMode: IEditMode;
  editorTarget: IEditorTarget;
  shapeDrawing: boolean;
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
  snapDivision: number;
  showConfig: boolean;
  showKeyId: boolean;
  showKeyIndex: boolean;
}

export type IEnvBoolPropKey =
  | 'showAxis'
  | 'showGrid'
  | 'snapToGrid'
  | 'showConfig'
  | 'showKeyId'
  | 'showKeyIndex';

interface IAppState {
  editor: IEditState;
  env: IEnvState;
}

export function createFallbackEditKeyboardDesign(): IEditKeyboardDesign {
  return {
    placementUnit: 'mm',
    placementAnchor: 'center',
    keySizeUnit: 'KP',
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
    design: createFallbackEditKeyboardDesign(),
    currentkeyEntityId: undefined,
    isCurrentKeyMirror: false,
    currentShapeId: undefined,
    currentPointIndex: -1,
    editorTarget: 'key',
    editMode: 'move',
    shapeDrawing: false,
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
    snapDivision: 4,
    showConfig: true,
    showKeyId: true,
    showKeyIndex: true,
  },
};
