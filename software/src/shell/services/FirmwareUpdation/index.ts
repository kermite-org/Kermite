import { ComPortsMonitor, ComPortsListener } from './ComPortsMonitor';
import { FirmwareFilesManager } from './FirmwareFilesManager';
import { FirmwareFilesResource } from './FirmwareFilesResource';
import { FlashCommander } from './FlashCommander';

// 仮想COMポートでProMicroのブートローダ(Caterina)と通信しファームウェアを書き込む
// 仮想COMポートの列挙や出現監視も行う
export class FirmwareUpdationService {
  private comPortsMonitor = new ComPortsMonitor();
  private binaryFilesManager = new FirmwareFilesManager();

  getFirmwareNamesAvailable(): string[] {
    return this.binaryFilesManager.firmwareNames;
  }

  subscribeComPorts = (listener: ComPortsListener) => {
    this.comPortsMonitor.subscribeComPorts(listener);
  };

  unsubscribeComPorts = (listener: ComPortsListener) => {
    this.comPortsMonitor.unsubscribeComPorts(listener);
  };

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
  }

  async terminate() {
    this.comPortsMonitor.terminateTicker();
  }
}
