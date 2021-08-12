import { IKermiteStandardKeyboaredSpec } from '@/CoreDefinitions';

export const keyboardSpec_astelia: IKermiteStandardKeyboaredSpec = {
  baseFirmwareType: 'AvrUnified',
  useBoardLedsProMicroAvr: true,
  useDebugUart: true,
  useMatrixKeyScanner: true,
  matrixColumnPins: ['PC6', 'PD4', 'PF7', 'PF6', 'PF5', 'PF4'],
  matrixRowPins: ['PB1', 'PB3', 'PB2', 'PB6', 'PD7', 'PE6', 'PB4', 'PB5'],
};

export const keyboardSpec_dw4: IKermiteStandardKeyboaredSpec = {
  baseFirmwareType: 'AvrUnified',
  useBoardLedsProMicroAvr: true,
  useDebugUart: true,
  useDirectWiredKeyScanner: true,
  directWiredPins: ['PE6', 'PB4', 'PB5', 'PB6'],
};

export const keyboardSpec_mp2105: IKermiteStandardKeyboaredSpec = {
  baseFirmwareType: 'RpUnified',
  useBoardLedsProMicroRp: true,
  useDebugUart: true,
  useMatrixKeyScanner: true,
  matrixColumnPins: ['GP6', 'GP7', 'GP8', 'GP9'],
  matrixRowPins: ['GP20', 'GP23', 'GP21'],
};

export const keyboardSpec_km60: IKermiteStandardKeyboaredSpec = {
  baseFirmwareType: 'RpUnified',
  useBoardLedsProMicroRp: true,
  useDebugUart: true,
  useMatrixKeyScanner: true,
  matrixColumnPins: ['GP29', 'GP28', 'GP27', 'GP26', 'GP22', 'GP20', 'GP23'],
  matrixRowPins: [
    'GP1',
    'GP2',
    'GP3',
    'GP4',
    'GP5',
    'GP6',
    'GP7',
    'GP8',
    'GP9',
    'GP21',
  ],
};
