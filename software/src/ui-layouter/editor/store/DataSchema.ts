export type IKeySizeUnit = 'mm' | 'KP';

export type IKeyPlacementAnchor = 'topLeft' | 'center';

// ------------------------------------------------------
export interface IKeyEntity {
  // label: string;
  x: number;
  y: number;
  angle: number;
  shape: string;
  keyIndex?: number;
  mirrorKeyIndex?: number;
  groupIndex?: number;
}

// export type IPersistOutlinePoint = { x: number; y: number };
export type IOutlinePoint = { x: number; y: number };

export type IOutlineShape = {
  points: IOutlinePoint[];
  groupIndex?: number;
};

export type ITransGroup = {
  // groupId: string;
  x: number;
  y: number;
  angle: number;
  mirror?: boolean;
};

export interface IKeyboardDesignSetup {
  placementUnit: string;
  placementAnchor: IKeyPlacementAnchor;
  keySizeUnit: IKeySizeUnit;
}
export interface IKeyboardDesign {
  setup: IKeyboardDesignSetup;
  keyEntities: IKeyEntity[];
  outlineShapes: IOutlineShape[];
  transGroups: ITransGroup[];
}

// ------------------------------------------------------
export interface IEditKeyEntity {
  id: string; // 編集中のみ一意の値を保持,永続化の際には保存しない
  // label: string;
  x: number;
  y: number;
  angle: number;
  shape: string; // `std ${width}` | `ref ${shapeName}`
  keyIndex: number;
  mirrorKeyIndex: number;
  groupId: string;
}

export type IEditOutlineShape = {
  id: string; // 編集中のみ一意の値を保持,永続化の際には保存しない
  points: IOutlinePoint[];
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
  placementUnit: string; // `mm` | `KP ${baseKeyPitch}`
  placementAnchor: IKeyPlacementAnchor;
  keySizeUnit: IKeySizeUnit; // 'mm' | 'KP'
  keyEntities: { [id: string]: IEditKeyEntity };
  outlineShapes: { [id: string]: IEditOutlineShape };
  transGroups: { [id: string]: IEditTransGroup };
}

// ------------------------------------------------------

export type IEditPropKey =
  // | 'label'
  'x' | 'y' | 'angle' | 'shape' | 'keyIndex' | 'mirrorKeyIndex' | 'groupId';
