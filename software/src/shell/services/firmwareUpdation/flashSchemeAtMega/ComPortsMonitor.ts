import { getArrayDiff, IntervalTimerWrapper } from '~/shared';
import { withAppErrorHandler } from '~/shell/base/ErrorChecker';
import { ComPortsResource } from './ComPortsResource';

export interface IComPortDetectionEvent {
  comPortName: string | undefined;
}

type IComPortDetectionCallback = (event: IComPortDetectionEvent) => void;

export class ComPortsMonitor {
  private timerWrapper = new IntervalTimerWrapper();
  private comPortNames: string[] = [];
  private iterationCount: number = 0;
  private detectionCallback: IComPortDetectionCallback | undefined;

  private updateComPortsMonitor = async () => {
    const allComPortNames = await ComPortsResource.getComPortNames();

    if (this.iterationCount > 0) {
      const [added, removed] = getArrayDiff(this.comPortNames, allComPortNames);

      if (removed.length > 0) {
        this.detectionCallback?.({ comPortName: undefined });
      }
      if (added.length > 0) {
        this.detectionCallback?.({ comPortName: added[0] });
      }
    }
    this.comPortNames = allComPortNames;
    this.iterationCount++;
  };

  startDetection(callback: IComPortDetectionCallback) {
    this.detectionCallback = callback;
    this.comPortNames = [];
    this.iterationCount = 0;
    this.timerWrapper.start(
      withAppErrorHandler(
        this.updateComPortsMonitor,
        'ComPortsMonitor_updateComPortsMonitor',
      ),
      1000,
      true,
    );
  }

  stopDetection() {
    this.detectionCallback = undefined;
    this.timerWrapper.stop();
  }
}
