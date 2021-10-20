export type ILayoutGeneratorOptions = {
  placementOrigin: 'topLeft' | 'center';
  invertX: boolean;
  invertXR: boolean;
  invertY: boolean;
  wrapX: number;
};

export const fallbackLayoutGeneratorOptions: ILayoutGeneratorOptions = {
  placementOrigin: 'topLeft',
  invertX: false,
  invertXR: false,
  invertY: false,
  wrapX: -1,
};

export type IDraftLayoutLabelEntityPinType =
  | 'itself'
  | 'rowL'
  | 'rowR'
  | 'column';

export type IDraftLayoutLabelEntity = {
  keyId: string;
  pinType: IDraftLayoutLabelEntityPinType;
  pinName: string;
};
