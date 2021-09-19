import { IFirmwareTargetDevice } from '~/shared';

export type IFirmwareBinaryFileSpec = {
  filePath: string;
  targetDevice: IFirmwareTargetDevice;
};

export interface IFirmwareUpdateScheme {
  resetDeviceDetectionStatus(): void;
  updateDeviceDetection(): Promise<string | undefined>;
  flashFirmware(
    detectedDeviceSig: string,
    firmwareFilePath: string,
  ): Promise<'ok' | string>;
}
