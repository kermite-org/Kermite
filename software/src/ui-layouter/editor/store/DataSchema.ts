export type IKeySizeUnit = 'mm' | 'KP';

export type IKeyPlacementAnchor = 'topLeft' | 'center';
export interface IPersistentKeyEntity {
  keyId: string;
  x: number;
  y: number;
  r: number;
  shape: string;
  keyIndex: number;
}

export type IPersistOutlinePoint = [x: number, y: number];

export type IPersistOutlineShape = {
  points: IPersistOutlinePoint[];
};
export interface IPersistentKeyboardDesign {
  placementUnit: string;
  placementAnchor: IKeyPlacementAnchor;
  keySizeUnit: IKeySizeUnit;
  outlineShapes: IPersistOutlineShape[];
  keyEntities: IPersistentKeyEntity[];
}
export interface IKeyEntity {
  id: string; // 編集中のみ一意の値を保持,永続化の際には保存しない
  keyId: string;
  x: number;
  y: number;
  r: number;
  shape: string; // `std ${width}` | `ref ${shapeName}`
  keyIndex: number;
}
export type IOutlinePoint = { x: number; y: number };

export type IOutlineShape = {
  id: string; // 編集中のみ一意の値を保持,永続化の際には保存しない
  points: IOutlinePoint[];
};
export interface IKeyboardDesign {
  placementUnit: string; // `mm` | `KP ${baseKeyPitch}`
  placementAnchor: IKeyPlacementAnchor;
  keySizeUnit: IKeySizeUnit; // 'mm' | 'KP'
  outlineShapes: { [id: string]: IOutlineShape };
  keyEntities: { [id: string]: IKeyEntity };
}

export type IEditPropKey = 'keyId' | 'x' | 'y' | 'r' | 'shape' | 'keyIndex';
