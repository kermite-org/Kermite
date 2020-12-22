export interface IKeyEntity {
  id: string; // 編集中のみGUIDのような値を保持,永続化の際には保存しない
  keyId: string;
  x: number;
  y: number;
}

export type IEditPropKey = 'keyId' | 'x' | 'y';
export interface IKeyboardDesign {
  keyEntities: IKeyEntity[];
}
