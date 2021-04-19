import { IntervalTimerWrapper, IResourceOrigin } from '~/shared';
import { withAppErrorHandler } from '~/shell/base/ErrorChecker';
import { createEventPort } from '~/shell/funcs';
import { projectResourceProvider } from '~/shell/projectResources';
import { FirmwareUpdationSchemeAtMega } from '~/shell/services/firmwareUpdation/flashSchemeAtMega/FlashSchemeAtMega';
import { FirmwareUpdationSchemeRp_Mac } from '~/shell/services/firmwareUpdation/flashSchemeRp/FlashSchemeRp_Mac';

interface IDeviceDetectionEvent {
  comPortName?: string;
  driveName?: string;
}

export class FirmwareUpdationService {
  private timerWrapper = new IntervalTimerWrapper();

  private schemeAtMega = new FirmwareUpdationSchemeAtMega();
  private schemeRp = new FirmwareUpdationSchemeRp_Mac();
  private pluggedComPortName: string | undefined;
  private pluggedDriveName: string | undefined;

  deviceDetectionEvents = createEventPort<IDeviceDetectionEvent>({
    onFirstSubscriptionStarting: () => this.startDetection(),
    onLastSubscriptionEnded: () => this.stopDetection(),
  });

  private emitDetectionEvent() {
    this.deviceDetectionEvents.emit({
      comPortName: this.pluggedComPortName,
      driveName: this.pluggedDriveName,
    });
  }

  private updateDetection = async () => {
    const pluggedComPortName = await this.schemeAtMega.updateDeviceDetection();
    if (this.pluggedComPortName !== pluggedComPortName) {
      this.pluggedComPortName = pluggedComPortName;
      this.emitDetectionEvent();
    }
    const pluggedDriveName = await this.schemeRp.updateDeviceDetection();
    if (this.pluggedDriveName !== pluggedDriveName) {
      this.pluggedDriveName = pluggedDriveName;
      this.emitDetectionEvent();
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
    variationName: string,
  ): Promise<'ok' | string> {
    const binarySpec = await projectResourceProvider.loadProjectFirmwareFile(
      origin,
      projectId,
      variationName,
    );

    if (!binarySpec) {
      return `cannot find firmware`;
    }

    if (binarySpec.targetDevice === 'atmega32u4') {
      if (!this.pluggedComPortName) {
        return `target com port unavailable`;
      }
      return await this.schemeAtMega.flashFirmware(
        this.pluggedComPortName,
        binarySpec.filePath,
      );
    }
    if (binarySpec.targetDevice === 'rp2040') {
      if (!this.pluggedDriveName) {
        return `target drive unavailable`;
      }
      return await this.schemeRp.flashFirmware(
        this.pluggedDriveName,
        binarySpec.filePath,
      );
    }
    return `cannot determine updation method for ${binarySpec.filePath}`;
  }
}
