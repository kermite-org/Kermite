import {
  IExtraShapeDefinition,
  IKeyIdMode,
  IKeyPlacementAnchor,
} from '~/shared';

// ------------------------------------------------------
export interface IEditKeyEntity {
  id: string; // 編集中のみ一意の値を保持,永続化の際には保存しない
  editKeyId: string;
  mirrorEditKeyId: string;
  x: number;
  y: number;
  angle: number;
  shape: string; // `std ${width}` | `ref ${shapeName}`
  keyIndex: number;
  mirrorKeyIndex: number;
  groupId: string;
}

export type IEditOutlinePoint = { x: number; y: number };

export type IEditOutlineShape = {
  id: string; // 編集中のみ一意の値を保持,永続化の際には保存しない
  points: IEditOutlinePoint[];
  groupId: string;
};

export type IEditTransGroup = {
  id: string; // 編集中のみ一意の値を保持,永続化の際には保存しない, 値はインデクスを文字列化したもの
  // groupId: string;
  x: number;
  y: number;
  angle: number;
  mirror: boolean;
};
export interface IEditKeyboardDesign {
  setup: {
    placementUnit: string; // `mm` | `KP x <y>`
    placementAnchor: IKeyPlacementAnchor;
    keySizeUnit: string; // 'mm' | 'KP x <y>'
    keyIdMode: IKeyIdMode;
  };
  keyEntities: { [id: string]: IEditKeyEntity };
  outlineShapes: { [id: string]: IEditOutlineShape };
  transGroups: { [id: string]: IEditTransGroup };
  extraShape: IExtraShapeDefinition;
}

// ------------------------------------------------------

export type IEditPropKey =
  | 'editKeyId'
  | 'mirrorEditKeyId'
  | 'x'
  | 'y'
  | 'angle'
  | 'shape'
  | 'keyIndex'
  | 'mirrorKeyIndex'
  | 'groupId';
