export type IStandardBaseFirmwareType = 'RpUnified' | 'RpSplit' | 'RpOddSplit';

export type IStandardFirmwareBoardType =
  | 'ChipRP2040'
  | 'ProMicroRP2040'
  | 'RpiPico'
  | 'KB2040'
  | 'XiaoRP2040'
  | 'RP2040Zero';

export type IStandardFirmwareConfig = {
  baseFirmwareType: IStandardBaseFirmwareType;
  boardType: IStandardFirmwareBoardType;
  useBoardLeds?: boolean;
  useDebugUart?: boolean;
  useMatrixKeyScanner?: boolean;
  matrixRowPins?: string[];
  matrixColumnPins?: string[];
  matrixRowPinsR?: string[];
  matrixColumnPinsR?: string[];
  useDirectWiredKeyScanner?: boolean;
  directWiredPins?: string[];
  directWiredPinsR?: string[];
  useEncoder?: boolean;
  encoderPins?: string[];
  encoderPinsR?: string[];
  useLighting?: boolean;
  lightingPin?: string;
  lightingNumLeds?: number;
  lightingNumLedsR?: number;
  useLcd?: boolean;
  singleWireSignalPin?: string;
};

export type IStandardFirmwareEntityData = {
  type: 'standard';
  variationId: string;
  standardFirmwareConfig: IStandardFirmwareConfig;
};
