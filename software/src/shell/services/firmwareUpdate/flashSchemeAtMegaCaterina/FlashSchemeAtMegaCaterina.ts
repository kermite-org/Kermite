import { IFirmwareUpdateScheme } from '~/shell/services/firmwareUpdate/Interfaces';
import { ComPortsMonitor } from '~/shell/services/firmwareUpdate/flashSchemeAtMegaCaterina/ComPortsMonitor';
import { FlashCommander } from '~/shell/services/firmwareUpdate/flashSchemeAtMegaCaterina/FlashCommander';

export class FirmwareUpdateSchemeAtMegaCaterina
  implements IFirmwareUpdateScheme {
  private comPortsMonitor = new ComPortsMonitor();

  resetDeviceDetectionStatus() {
    this.comPortsMonitor.resetDeviceDetectionStatus();
  }

  async updateDeviceDetection() {
    return await this.comPortsMonitor.updateDeviceDetection();
  }

  async flashFirmware(
    detectedDeviceSig: string,
    firmwareFilePath: string,
  ): Promise<'ok' | string> {
    const comPortName = detectedDeviceSig;
    const hexFilePath = firmwareFilePath;

    const flashResult = await FlashCommander.uploadFirmware(
      hexFilePath,
      comPortName,
    );
    if (flashResult !== 'ok') {
      console.log(`firmware upload error`);
    }
    console.log(flashResult);
    return flashResult;
  }
}
