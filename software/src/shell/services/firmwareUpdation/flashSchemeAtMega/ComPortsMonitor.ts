import { IntervalTimerWrapper } from '~/shared';
import { withAppErrorHandler } from '~/shell/base/ErrorChecker';
import { ComPortsResource } from './ComPortsResource';

export interface IComPortDetectionEvent {
  comPortName: string | undefined;
}

type IComPortDetectionCallback = (event: IComPortDetectionEvent) => void;
export class ComPortsMonitor {
  private timerWrapper = new IntervalTimerWrapper();
  private comPortNames: string[] = [];
  private activeComPortName: string | undefined = undefined;
  private comPortEnumerationStartTime: number = 0;
  private detectionCallback: IComPortDetectionCallback | undefined;

  private updateComPortsMonitor = async () => {
    const newComPortNames = await ComPortsResource.getComPortNames();

    const newlyAppearedPortName = newComPortNames.find(
      (portName) => !this.comPortNames.includes(portName),
    );
    const elapsed = Date.now() - this.comPortEnumerationStartTime;
    if (elapsed > 2000 && !this.activeComPortName && newlyAppearedPortName) {
      this.detectionCallback?.({ comPortName: newlyAppearedPortName });
      this.activeComPortName = newlyAppearedPortName;
    }

    if (
      this.activeComPortName &&
      !newComPortNames.includes(this.activeComPortName)
    ) {
      this.detectionCallback?.({ comPortName: undefined });
      this.activeComPortName = undefined;
    }

    this.comPortNames = newComPortNames;
  };

  startDetection(callback: IComPortDetectionCallback) {
    this.detectionCallback = callback;
    this.comPortEnumerationStartTime = Date.now();
    this.timerWrapper.start(
      withAppErrorHandler(
        this.updateComPortsMonitor,
        'ComPortsMonitor_updateComPortsMonitor',
      ),
      1000,
    );
  }

  stopDetection() {
    this.detectionCallback = undefined;
    this.timerWrapper.stop();
  }
}
