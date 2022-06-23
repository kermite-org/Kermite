export type IBoardImageSig = 'proMicro' | 'proMicroRp2040' | 'rpiPico';

export type IBoardPinAssignsData = {
  unitPixels: number;
  boardUnitWidth: number;
  boardUnitHeight: number;
  boardImageSig: IBoardImageSig;
  pinsRowOffset: number;
  pinNames: string[];
};

export type IBoardPinAssignsDataEx = IBoardPinAssignsData & {
  pinFunctionNames: string[];
};
