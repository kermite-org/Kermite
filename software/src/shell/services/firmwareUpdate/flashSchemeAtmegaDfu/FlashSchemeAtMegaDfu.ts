import * as usb from 'usb';
import { avrDfuFlashCommander_flashFirmware } from '~/shell/services/firmwareUpdate/flashSchemeAtmegaDfu/AvrDfuFlashCommander';
import { IFirmwareUpdateScheme } from '~/shell/services/firmwareUpdate/types';

export class FirmwareUpdateSchemeAtMegaDfu implements IFirmwareUpdateScheme {
  resetDeviceDetectionStatus() {}

  // eslint-disable-next-line @typescript-eslint/require-await
  async updateDeviceDetection() {
    const devices = usb.getDeviceList();
    const device = devices.find(
      (d) =>
        // ATmega32U4
        d.deviceDescriptor.idVendor === 0x03eb &&
        d.deviceDescriptor.idProduct === 0x2ff4,
    );
    return (device && `deviceAddress: ${device.deviceAddress}`) || undefined;
  }

  async flashFirmware(
    detectedDeviceSig: string,
    firmwareFilePath: string,
  ): Promise<'ok' | string> {
    return await avrDfuFlashCommander_flashFirmware(firmwareFilePath);
  }
}
