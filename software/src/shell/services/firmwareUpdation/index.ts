import { IntervalTimerWrapper, IResourceOrigin } from '~/shared';
import { withAppErrorHandler } from '~/shell/base/ErrorChecker';
import { createEventPort } from '~/shell/funcs';
import { projectResourceProvider } from '~/shell/projectResources';
import { FirmwareUpdationSchemeAtMega } from '~/shell/services/firmwareUpdation/flashSchemeAtMega/FlashSchemeAtMega';

interface IComPortDetectionEvent {
  comPortName: string | undefined;
}

export class FirmwareUpdationService {
  private timerWrapper = new IntervalTimerWrapper();

  private schemeAtMega = new FirmwareUpdationSchemeAtMega();
  private pluggedComPortName: string | undefined;

  deviceDetectionEvents = createEventPort<IComPortDetectionEvent>({
    onFirstSubscriptionStarting: () => this.startDetection(),
    onLastSubscriptionEnded: () => this.stopDetection(),
  });

  private updateDetection = async () => {
    const pllugedComPortName = await this.schemeAtMega.updateDeviceDetection();
    if (pllugedComPortName !== this.pluggedComPortName) {
      this.deviceDetectionEvents.emit({ comPortName: pllugedComPortName });
      this.pluggedComPortName = pllugedComPortName;
    }
  };

  private startDetection() {
    this.pluggedComPortName = undefined;
    this.schemeAtMega.resetDeviceDetectionStatus();
    this.timerWrapper.start(
      withAppErrorHandler(
        this.updateDetection,
        'ComPortsMonitor_updateComPortsMonitor',
      ),
      1000,
      true,
    );
  }

  private stopDetection() {
    this.timerWrapper.stop();
  }

  async writeFirmware(
    origin: IResourceOrigin,
    projectId: string,
  ): Promise<'ok' | string> {
    const hexFilePath = await projectResourceProvider.loadProjectFirmwareFile(
      origin,
      projectId,
    );
    if (!hexFilePath) {
      return `cannot find firmware`;
    }

    if (!this.pluggedComPortName) {
      return `com port is not available`;
    }
    return await this.schemeAtMega.flashFirmware(
      this.pluggedComPortName,
      hexFilePath,
    );
  }
}
