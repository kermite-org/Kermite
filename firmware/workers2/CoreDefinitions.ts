export type IKermiteStandardKeyboaredSpec = {
  useBoardsLedsProMicroAvr?: boolean;
  useDebugUart?: boolean;
  useMatrixKeyScanner?: boolean;
  useDirectWiredKeyScanner?: boolean;
  numMatrixColumns?: number;
  numMatrixRows?: number;
  numDirectWiredKeys?: number;
  keyScannerPins?: number[];
};

export const enum Pins {
  PB0 = 0,
  PB1,
  PB2,
  PB3,
  PB4,
  PB5,
  PB6,
  PB7,
  PC0 = 8,
  PC1,
  PC2,
  PC3,
  PC4,
  PC5,
  PC6,
  PC7,
  PD0 = 16,
  PD1,
  PD2,
  PD3,
  PD4,
  PD5,
  PD6,
  PD7,
  PE0 = 24,
  PE1,
  PE2,
  PE3,
  PE4,
  PE5,
  PE6,
  PE7,
  PF0 = 32,
  PF1,
  PF2,
  PF3,
  PF4,
  PF5,
  PF6,
  PF7,
}
