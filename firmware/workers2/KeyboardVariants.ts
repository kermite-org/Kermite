import { IKermiteStandardKeyboaredSpec, Pins } from '@/CoreDefinitions';

export const keyboardSpec_astelia: IKermiteStandardKeyboaredSpec = {
  useBoardsLedsProMicroAvr: true,
  useDebugUart: true,
  useMatrixKeyScanner: true,
  numMatrixColumns: 6,
  numMatrixRows: 8,
  keyScannerPins: [
    //columns
    Pins.PC6,
    Pins.PD4,
    Pins.PF7,
    Pins.PF6,
    Pins.PF5,
    Pins.PF4,
    //rows
    Pins.PB1,
    Pins.PB3,
    Pins.PB2,
    Pins.PB6,
    Pins.PD7,
    Pins.PE6,
    Pins.PB4,
    Pins.PB5,
  ],
};

export const keyboardSpec_dw4: IKermiteStandardKeyboaredSpec = {
  useBoardsLedsProMicroAvr: true,
  useDebugUart: true,
  useDirectWiredKeyScanner: true,
  numDirectWiredKeys: 4,
  keyScannerPins: [Pins.PE6, Pins.PB4, Pins.PB5, Pins.PB6],
};
