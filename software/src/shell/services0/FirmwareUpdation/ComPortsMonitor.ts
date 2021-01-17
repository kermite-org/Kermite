import { removeArrayItems } from '~/shared';
import { ComPortsResource } from './ComPortsResource';

export interface ComPortsListener {
  (event: { comPortName: string | undefined }): void;
}

export class ComPortsMonitor {
  private intervalTimerHandle: NodeJS.Timeout | undefined = undefined;

  private comPortListeners: ComPortsListener[] = [];
  private comPortNames: string[] = [];
  private activeComPortName: string | undefined = undefined;
  private comPortEnumerationStartTime: number = 0;

  comPortPlugEvents = {
    subscribe: (listener: ComPortsListener) => {
      this.comPortListeners.push(listener);
      this.comPortEnumerationStartTime = Date.now();
    },
    unsubscribe: (listener: ComPortsListener) => {
      removeArrayItems(this.comPortListeners, listener);
    },
  };

  private updateComPortsMonitor = async () => {
    if (this.comPortListeners.length > 0) {
      const newComPortNames = await ComPortsResource.getComPortNames();
      // console.log({ newComPortNames });
      const newlyAppearedPortName = newComPortNames.find(
        (portName) => !this.comPortNames.includes(portName),
      );
      const elapsed = Date.now() - this.comPortEnumerationStartTime;
      if (elapsed > 2000 && !this.activeComPortName && newlyAppearedPortName) {
        // console.log(`COM PORT ${newlyAppearedPortName} appeared`);
        this.comPortListeners.forEach((listener) =>
          listener({ comPortName: newlyAppearedPortName }),
        );
        this.activeComPortName = newlyAppearedPortName;
      }

      if (
        this.activeComPortName &&
        !newComPortNames.includes(this.activeComPortName)
      ) {
        // console.log(`COM PORT ${this.activeComPortName} disappeared`);
        this.comPortListeners.forEach((listener) =>
          listener({ comPortName: undefined }),
        );
        this.activeComPortName = undefined;
      }

      this.comPortNames = newComPortNames;
    }
  };

  initializeTicker() {
    this.intervalTimerHandle = setInterval(this.updateComPortsMonitor, 500);
  }

  terminateTicker() {
    if (this.intervalTimerHandle) {
      clearInterval(this.intervalTimerHandle);
      this.intervalTimerHandle = undefined;
    }
  }
}
