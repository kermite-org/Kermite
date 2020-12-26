export interface IPersistentKeyEntity {
  keyId: string;
  x: number;
  y: number;
  r: number;
  shape: string;
  keyIndex: number;
}

export interface IPersistentKeyboardDesign {
  keyEntities: IPersistentKeyEntity[];
}

export interface IKeyEntity {
  id: string; // 編集中のみ一意の値を保持,永続化の際には保存しない
  keyId: string;
  x: number;
  y: number;
  r: number;
  shape: string;
  keyIndex: number;
}
export interface IKeyboardDesign {
  keyEntities: { [id: string]: IKeyEntity };
}

export type IEditPropKey = 'keyId' | 'x' | 'y' | 'r' | 'keyIndex';
