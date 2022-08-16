export type IBoardImageSig =
  | 'proMicro'
  | 'proMicroRp2040'
  | 'rpiPico'
  | 'kb2040'
  | 'xiaoRp2040'
  | 'rp2040Zero';

export type IBoardPinAssignsData = {
  unitPixels: number;
  boardUnitWidth: number;
  boardUnitHeight: number;
  boardImageSig: IBoardImageSig;
  pinsRowOffset: number;
  pinNames: string[];
  pinNamesBottom?: string[];
};

export type IBoardPinAssignsDataEx = IBoardPinAssignsData & {
  pinFunctionNames: string[];
  pinFunctionNamesBottom?: string[];
};
