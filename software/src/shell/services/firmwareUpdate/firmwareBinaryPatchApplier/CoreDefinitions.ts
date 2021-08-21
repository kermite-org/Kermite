export type IKermiteStandardKeyboardRawSpec = {
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
