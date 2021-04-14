export interface IFirmwareUpdationScheme {
  resetDeviceDetectionStatus(): void;
  updateDeviceDetection(): Promise<string | undefined>;
  flashFirmware(
    dectectedDeviceSig: string,
    firmwareFilePath: string,
  ): Promise<'ok' | string>;
}
