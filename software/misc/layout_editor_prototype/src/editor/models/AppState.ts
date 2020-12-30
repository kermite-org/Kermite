import { createDictionaryFromKeyValues } from '~/base/utils';
import {
  IKeyboardDesign,
  IKeyEntity,
  IPersistentKeyboardDesign,
} from '~/editor/models/DataSchema';

const initialDesign: IPersistentKeyboardDesign = {
  placementUnit: 'mm',
  keySizeUnit: 'U',
  outlinePoints: [
    [80, -40],
    [80, 40],
    [-80, 40],
    [-80, -40],
  ],
  keyEntities: [
    {
      keyId: 'key0',
      x: 0,
      y: 0,
      r: 0,
      shape: 'std 1',
      keyIndex: -1,
    },
    {
      keyId: 'key1',
      x: 20,
      y: 0,
      r: 0,
      shape: 'std 1',
      keyIndex: -1,
    },
    {
      keyId: 'key2',
      x: 40,
      y: 0,
      r: 0,
      shape: 'ext circle',
      keyIndex: -1,
    },
  ],
};

function loadKeyboardDesign(
  source: IPersistentKeyboardDesign
): IKeyboardDesign {
  let cnt = 0;
  return {
    placementUnit: source.placementUnit,
    keySizeUnit: source.keySizeUnit,
    outlinePoints: source.outlinePoints,
    keyEntities: createDictionaryFromKeyValues(
      source.keyEntities.map((ke) => {
        const id = `ke-${cnt++}`;
        return [id, { ...ke, id }];
      })
    ),
  };
}

export type IEditorTarget = 'key' | 'outline';
export type IEditMode = 'select' | 'add' | 'move' | 'split';

export interface IModeState {
  editMode: IEditMode;
  editorTarget: IEditorTarget;
}
export interface IEditState {
  design: IKeyboardDesign;
  currentkeyEntityId: string | undefined;
  currentPointIndex: number;
  editMode: IEditMode;
  editorTarget: IEditorTarget;
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
  ghost: IKeyEntity | undefined;
  sight: ISight;
  showAxis: boolean;
  showGrid: boolean;
  snapToGrid: boolean;
  snapDivision: number;
  showConfig: boolean;
}
interface IAppState {
  editor: IEditState;
  env: IEnvState;
}

export const appState: IAppState = {
  editor: {
    design: loadKeyboardDesign(initialDesign),
    currentkeyEntityId: undefined,
    currentPointIndex: -1,
    editorTarget: 'key',
    editMode: 'move',
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
  },
};
