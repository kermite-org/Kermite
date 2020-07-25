import { BinaryFileResource } from './BinaryFileResource';
import { SerialPortResource } from './SerialPortResource';
import { removeArrayItems } from '~funcs/Utils';

interface ComPortsListener {
  (comPortName: string | undefined): void;
}

export class FirmwareUpdationService {
  private binaryFileNames: string[] = [];

  private intervalTimerHandle: NodeJS.Timeout | undefined = undefined;

  getFirmwareNamesAvailable(): string[] {
    return this.binaryFileNames;
  }

  private async loadBinaryFileNames() {
    await BinaryFileResource.ensureBinariesDirectoryExists();
    this.binaryFileNames = await BinaryFileResource.listAllBinaryFileNames();
    // console.log({ fnames: this.binaryFileNames });
  }

  //----------------------------------------

  private comPortListeners: ComPortsListener[] = [];
  private comPortNames: string[] = [];
  private activeComPortName: string | undefined = undefined;
  private comPortEnumerationStartTime: number = 0;

  subscribeComPorts(listener: (comPortName: string | undefined) => void) {
    this.comPortListeners.push(listener);
    this.comPortEnumerationStartTime = Date.now();
  }

  unsubscribeComPorts(listener: (comPortName: string | undefined) => void) {
    removeArrayItems(this.comPortListeners, listener);
  }

  updateComPortsMonitor = async () => {
    if (this.comPortListeners.length > 0) {
      const newComPortNames = await SerialPortResource.getComPortNames();
      // console.log({ newComPortNames });
      const newlyAppearedPortName = newComPortNames.find(
        (portName) => !this.comPortNames.includes(portName)
      );
      const elapsed = Date.now() - this.comPortEnumerationStartTime;
      if (elapsed > 2000 && !this.activeComPortName && newlyAppearedPortName) {
        // console.log(`COM PORT ${newlyAppearedPortName} appeared`);
        this.comPortListeners.forEach((listener) =>
          listener(newlyAppearedPortName)
        );
        this.activeComPortName = newlyAppearedPortName;
      }

      if (
        this.activeComPortName &&
        !newComPortNames.includes(this.activeComPortName)
      ) {
        // console.log(`COM PORT ${this.activeComPortName} disappeared`);
        this.comPortListeners.forEach((listener) => listener(undefined));
        this.activeComPortName = undefined;
      }

      this.comPortNames = newComPortNames;
    }
  };

  //----------------------------------------

  async initialize(): Promise<void> {
    this.loadBinaryFileNames();
    this.intervalTimerHandle = setInterval(this.updateComPortsMonitor, 1000);

    //debug
    this.subscribeComPorts((portName) => {
      console.log('com port detected', { portName });
    });
  }

  async terminate(): Promise<void> {
    if (this.intervalTimerHandle) {
      clearInterval(this.intervalTimerHandle);
      this.intervalTimerHandle = undefined;
    }
  }
}
