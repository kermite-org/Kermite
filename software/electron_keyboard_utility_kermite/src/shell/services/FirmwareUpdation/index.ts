import { ComPortsMonitor, ComPortsListener } from './ComPortsMonitor';
import { FirmwareFilesManager } from './FirmwareFilesManager';
import { FlashCommander } from './FlashCommander';
import { FirmwareFilesResource } from './FirmwareFilesResource';

export class FirmwareUpdationService {
  private comPortsMonitor = new ComPortsMonitor();
  private binaryFilesManager = new FirmwareFilesManager();

  getFirmwareNamesAvailable(): string[] {
    return this.binaryFilesManager.firmwareNames;
  }

  subscribeComPorts(listener: ComPortsListener) {
    this.comPortsMonitor.subscribeComPorts(listener);
  }

  unsubscribeComPorts(listener: ComPortsListener) {
    this.comPortsMonitor.unsubscribeComPorts(listener);
  }

  async writeFirmware(
    firmwareName: string,
    comPortName: string
  ): Promise<'ok' | string> {
    const hexFilePath = FirmwareFilesResource.getHexFilePath(firmwareName);
    const flashResult = await FlashCommander.uploadFirmware(
      hexFilePath,
      comPortName
    );
    if (flashResult !== 'ok') {
      console.log(`firmwre upload error`);
    }
    console.log(flashResult);
    return flashResult;
  }

  async initialize() {
    this.binaryFilesManager.loadFirmwareFileNames();
    this.comPortsMonitor.initializeTicker();

    if (0) {
      //debug
      console.log(
        `firmware updation debug enabled, double press reset button to upload firmware`
      );
      this.subscribeComPorts((comPortName: string | undefined) => {
        console.log('com port detected', { comPortName });
        if (comPortName) {
          const firmwareName = this.getFirmwareNamesAvailable()[1];
          console.log(`write firmware ${firmwareName} to ${comPortName}`);
          this.writeFirmware(firmwareName, comPortName);
        }
      });
    }
  }

  async terminate() {
    this.comPortsMonitor.terminateTicker();
  }
}
