import { IKermiteStandardKeyboaredSpec } from '@/CoreDefinitions';

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
