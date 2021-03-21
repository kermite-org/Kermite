/* eslint-disable @typescript-eslint/require-await */
import { IFirmwareUpdationScheme } from '~/shell/services/firmwareUpdation/interfaces';

export class FirmwareUpdationSchemeRP implements IFirmwareUpdationScheme {
  resetDeviceDetectionStatus() {}

  async updateDeviceDetection() {
    return undefined;
  }

  async flashFirmware(
    dectectedDeviceSig: string,
    firmwareFilePath: string,
  ): Promise<'ok' | string> {
    return 'not implemented';
  }
}
