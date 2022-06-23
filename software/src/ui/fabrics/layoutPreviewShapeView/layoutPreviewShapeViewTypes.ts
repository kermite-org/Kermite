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
