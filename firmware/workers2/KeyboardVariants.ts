import { IKermiteStandardKeyboaredRawSpec, Pins } from '@/CoreDefinitions';

export const keyboardSpec_astelia: IKermiteStandardKeyboaredRawSpec = {
  useBoardLedsProMicroAvr: true,
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

export const keyboardSpec_dw4: IKermiteStandardKeyboaredRawSpec = {
  useBoardLedsProMicroAvr: true,
  useDebugUart: true,
  useDirectWiredKeyScanner: true,
  numDirectWiredKeys: 4,
  keyScannerPins: [Pins.PE6, Pins.PB4, Pins.PB5, Pins.PB6],
};

export const keyboardSpec_mp2105: IKermiteStandardKeyboaredRawSpec = {
  useBoardLedsProMicroRp: true,
  useDebugUart: true,
  useMatrixKeyScanner: true,
  numMatrixColumns: 4,
  numMatrixRows: 3,
  keyScannerPins: [
    //columns
    Pins.GP6,
    Pins.GP7,
    Pins.GP8,
    Pins.GP9,
    //rows
    Pins.GP20,
    Pins.GP23,
    Pins.GP21,
  ],
};

export const keyboardSpec_km60: IKermiteStandardKeyboaredRawSpec = {
  useBoardLedsProMicroRp: true,
  useDebugUart: true,
  useMatrixKeyScanner: true,
  numMatrixColumns: 7,
  numMatrixRows: 10,
  keyScannerPins: [
    //columns
    Pins.GP29,
    Pins.GP28,
    Pins.GP27,
    Pins.GP26,
    Pins.GP22,
    Pins.GP20,
    Pins.GP23,
    //rows
    Pins.GP1,
    Pins.GP2,
    Pins.GP3,
    Pins.GP4,
    Pins.GP5,
    Pins.GP6,
    Pins.GP7,
    Pins.GP8,
    Pins.GP9,
    Pins.GP21,
  ],
};
