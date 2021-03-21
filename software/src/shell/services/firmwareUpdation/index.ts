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
  private dectectedDeviceSig: string | undefined;

  deviceDetectionEvents = createEventPort<IComPortDetectionEvent>({
    onFirstSubscriptionStarting: () => this.startDetection(),
    onLastSubscriptionEnded: () => this.stopDetection(),
  });

  private updateDetection = async () => {
    const dectectedDeviceSig = await this.schemeAtMega.updateDeviceDetection();
    if (dectectedDeviceSig !== this.dectectedDeviceSig) {
      this.deviceDetectionEvents.emit({ comPortName: dectectedDeviceSig });
      this.dectectedDeviceSig = dectectedDeviceSig;
    }
  };

  private startDetection() {
    this.dectectedDeviceSig = undefined;
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
    dectectedDeviceSig: string,
  ): Promise<'ok' | string> {
    const hexFilePath = await projectResourceProvider.loadProjectFirmwareFile(
      origin,
      projectId,
    );
    if (!hexFilePath) {
      return `cannot find firmware`;
    }
    return await this.schemeAtMega.flashFirmware(
      dectectedDeviceSig,
      hexFilePath,
    );
  }
}
