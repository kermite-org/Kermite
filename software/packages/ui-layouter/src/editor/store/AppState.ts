import { createDictionaryFromKeyValues } from '@kermite/shared';
import {
  IPersistentKeyboardDesign,
  IKeyboardDesign,
  IKeyEntity,
} from './DataSchema';

const initialDesignSource: IPersistentKeyboardDesign = {
  placementUnit: 'mm',
  placementAnchor: 'center',
  keySizeUnit: 'KP',
  outlinePoints: [
    [80, -40],
    [80, 40],
    [-80, 40],
    [-80, -40],
  ],
  keyEntities: [
    // {
    //   keyId: 'key0',
    //   x: 0,
    //   y: 0,
    //   r: 0,
    //   shape: 'std 1',
    //   keyIndex: -1,
    // },
    // {
    //   keyId: 'key1',
    //   x: 20,
    //   y: 0,
    //   r: 0,
    //   shape: 'std 1',
    //   keyIndex: -1,
    // },
    // {
    //   keyId: 'key2',
    //   x: 40,
    //   y: 0,
    //   r: 0,
    //   shape: 'ext circle',
    //   keyIndex: -1,
    // },
  ],
};

export function createDefaultKeyboardDesign(): IKeyboardDesign {
  const source = initialDesignSource;
  let cnt = 0;
  return {
    placementUnit: source.placementUnit,
    placementAnchor: source.placementAnchor,
    keySizeUnit: source.keySizeUnit,
    outlinePoints: source.outlinePoints.map(([x, y]) => ({ x, y })),
    keyEntities: createDictionaryFromKeyValues(
      source.keyEntities.map((ke) => {
        const id = `ke${cnt++}`;
        return [id, { ...ke, id }];
      }),
    ),
  };
}

function loadKeyboardDesignOrDefault(): IKeyboardDesign {
  const text = localStorage.getItem('savedDesign');
  if (text) {
    const obj = JSON.parse(text) as IKeyboardDesign;
    if (!obj.placementAnchor) {
      obj.placementAnchor = 'center';
    }
    return obj;
  } else {
    return createDefaultKeyboardDesign();
  }
}

export function saveEditKeyboardDesign() {
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  const obj = appState.editor.design;
  const text = JSON.stringify(obj);
  localStorage.setItem('savedDesign', text);
}

export type IEditorTarget = 'key' | 'outline';
export type IEditMode = 'select' | 'add' | 'move' | 'delete';

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

export const appState: IAppState = {
  editor: {
    design: loadKeyboardDesignOrDefault(),
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
    showKeyId: true,
    showKeyIndex: true,
  },
};
