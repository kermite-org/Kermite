import { ComPortsMonitor, ComPortsListener } from './ComPortsMonitor';
import { BinaryFilesManager } from './BinaryFilesManager';

export class FirmwareUpdationService {
  private comPortsMonitor = new ComPortsMonitor();
  private binaryFilesManager = new BinaryFilesManager();

  getFirmwareNamesAvailable(): string[] {
    return this.binaryFilesManager.binaryFileNames;
  }

  subscribeComPorts(listener: ComPortsListener) {
    this.comPortsMonitor.subscribeComPorts(listener);
  }

  unsubscribeComPorts(listener: ComPortsListener) {
    this.comPortsMonitor.unsubscribeComPorts(listener);
  }

  async initialize(): Promise<void> {
    this.binaryFilesManager.loadBinaryFileNames();
    this.comPortsMonitor.initializeTicker();

    //debug
    this.subscribeComPorts((portName) => {
      console.log('com port detected', { portName });
    });
  }

  async terminate(): Promise<void> {
    this.comPortsMonitor.terminateTicker();
  }
}
