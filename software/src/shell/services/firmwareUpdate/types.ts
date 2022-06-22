import { IFirmwareTargetDevice } from '~/shared';

export type IFirmwareBinaryFileSpec = {
  // filePath: string;
  fileName: string;
  targetDevice: IFirmwareTargetDevice;
  fileContentBytes: Uint8Array;
};

export interface IFirmwareUpdateScheme {
  resetDeviceDetectionStatus(): void;
  updateDeviceDetection(): Promise<string | undefined>;
  flashFirmware(
    detectedDeviceSig: string,
    firmwareFilePath: string,
  ): Promise<'ok' | string>;
}
