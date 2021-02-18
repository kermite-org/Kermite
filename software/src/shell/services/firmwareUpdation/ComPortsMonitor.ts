import { IntervalTimerWrapper } from '~/shared';
import { withAppErrorHandler } from '~/shell/base/ErrorChecker';
import { createEventPort2 } from '~/shell/funcs';
import { ComPortsResource } from './ComPortsResource';

interface IComPortEvent {
  comPortName: string | undefined;
}
export class ComPortsMonitor {
  private timerWrapper = new IntervalTimerWrapper();
  private comPortNames: string[] = [];
  private activeComPortName: string | undefined = undefined;
  private comPortEnumerationStartTime: number = 0;

  comPortPlugEvents = createEventPort2<IComPortEvent>({
    onFirstSubscriptionStarting: () => this.initializeTicker(),
    onLastSubscriptionEnded: () => this.terminateTicker(),
  });

  private initializeTicker() {
    this.comPortEnumerationStartTime = Date.now();
    this.timerWrapper.start(
      withAppErrorHandler(
        this.updateComPortsMonitor,
        'ComPortsMonitor_updateComPortsMonitor',
      ),
      1000,
    );
  }

  private terminateTicker() {
    this.timerWrapper.stop();
  }

  private updateComPortsMonitor = async () => {
    const newComPortNames = await ComPortsResource.getComPortNames();

    const newlyAppearedPortName = newComPortNames.find(
      (portName) => !this.comPortNames.includes(portName),
    );
    const elapsed = Date.now() - this.comPortEnumerationStartTime;
    if (elapsed > 2000 && !this.activeComPortName && newlyAppearedPortName) {
      this.comPortPlugEvents.emit({ comPortName: newlyAppearedPortName });
      this.activeComPortName = newlyAppearedPortName;
    }

    if (
      this.activeComPortName &&
      !newComPortNames.includes(this.activeComPortName)
    ) {
      this.comPortPlugEvents.emit({ comPortName: undefined });
      this.activeComPortName = undefined;
    }

    this.comPortNames = newComPortNames;
  };
}
