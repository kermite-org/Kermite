export interface IPersistentKeyEntity {
  keyId: string;
  x: number;
  y: number;
  r: number;
  shape: string;
  keyIndex: number;
}

export interface IPersistentKeyboardDesign {
  placementUnit: string; // `mm` | `KP ${baseKeyPitch}`
  displayArea: IDisplayArea;
  keyEntities: IPersistentKeyEntity[];
}

export interface IDisplayArea {
  top: number;
  left: number;
  bottom: number;
  right: number;
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
export interface IKeyboardDesign {
  placementUnit: string; // `mm` | `KP ${baseKeyPitch}`
  displayArea: IDisplayArea;
  keyEntities: { [id: string]: IKeyEntity };
}

export type IEditPropKey = 'keyId' | 'x' | 'y' | 'r' | 'shape' | 'keyIndex';
