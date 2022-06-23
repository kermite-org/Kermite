export type PinName =
  | 'GP0'
  | 'GP1'
  | 'GP2'
  | 'GP3'
  | 'GP4'
  | 'GP5'
  | 'GP6'
  | 'GP7'
  | 'GP8'
  | 'GP9'
  | 'GP10'
  | 'GP11'
  | 'GP12'
  | 'GP13'
  | 'GP14'
  | 'GP15'
  | 'GP16'
  | 'GP17'
  | 'GP18'
  | 'GP19'
  | 'GP20'
  | 'GP21'
  | 'GP22'
  | 'GP23'
  | 'GP24'
  | 'GP25'
  | 'GP26'
  | 'GP27'
  | 'GP28'
  | 'GP29';

export type IKermiteStandardKeyboaredRawSpec = {
  useBoardLedsProMicroAvr?: boolean;
  useBoardLedsProMicroRp?: boolean;
  useBoardLedsRpiPico?: boolean;
  useDebugUart?: boolean;
  useMatrixKeyScanner?: boolean;
  useDirectWiredKeyScanner?: boolean;
  numMatrixColumns?: number;
  numMatrixRows?: number;
  numDirectWiredKeys?: number;
  keyScannerPins?: number[];
};

export type IBaseFirmwareType = 'RpUnified' | 'RpSplit';

export type IKermiteStandardKeyboaredSpec = {
  baseFirmwareType: IBaseFirmwareType;
  useBoardLedsProMicroAvr__OBSOLETE?: boolean;
  useBoardLedsProMicroRp?: boolean;
  useBoardLedsRpiPico?: boolean;
  useDebugUart?: boolean;
  useMatrixKeyScanner?: boolean;
  matrixColumnPins?: PinName[];
  matrixRowPins?: PinName[];
  useDirectWiredKeyScanner?: boolean;
  directWiredPins?: PinName[];
};
