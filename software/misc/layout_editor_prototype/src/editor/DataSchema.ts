export interface IKeyEntity {
  id: string;
  x: number;
  y: number;
}

export interface IKeyboardDesign {
  keyEntities: IKeyEntity[];
}
