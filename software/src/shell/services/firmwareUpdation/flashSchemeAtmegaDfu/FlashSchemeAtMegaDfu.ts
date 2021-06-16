import * as usb from 'usb';
import { IFirmwareUpdationScheme } from '~/shell/services/firmwareUpdation/Interfaces';
import { avrDfuFlashCommander_flashFirmware } from '~/shell/services/firmwareUpdation/flashSchemeAtmegaDfu/AvrDfuFlashCommander';

export class FirmwareUpdationSchemeAtMegaDfu
  implements IFirmwareUpdationScheme
{
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
    dectectedDeviceSig: string,
    firmwareFilePath: string,
  ): Promise<'ok' | string> {
    return await avrDfuFlashCommander_flashFirmware(firmwareFilePath);
  }
}
