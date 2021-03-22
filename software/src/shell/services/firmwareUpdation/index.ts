import { IntervalTimerWrapper, IResourceOrigin } from '~/shared';
import { withAppErrorHandler } from '~/shell/base/ErrorChecker';
import { createEventPort } from '~/shell/funcs';
import { projectResourceProvider } from '~/shell/projectResources';
import { FirmwareUpdationSchemeAtMega } from '~/shell/services/firmwareUpdation/flashSchemeAtMega/FlashSchemeAtMega';
import { FirmwareUpdationSchemeRP } from '~/shell/services/firmwareUpdation/flashSchemeRP/FlashSchemeRP';

interface IDeviceDetectionEvent {
  comPortName?: string;
  driveName?: string;
}

export class FirmwareUpdationService {
  private timerWrapper = new IntervalTimerWrapper();

  private schemeAtMega = new FirmwareUpdationSchemeAtMega();
  private schemeRP = new FirmwareUpdationSchemeRP();
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
    const pluggedDriveName = await this.schemeRP.updateDeviceDetection();
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
  ): Promise<'ok' | string> {
    let firmwareFilePath = await projectResourceProvider.loadProjectFirmwareFile(
      origin,
      projectId,
    );

    // debug
    firmwareFilePath =
      '../firmware/build/proto/4x3pad/rp2040/4x3pad_rp2040.uf2';

    if (!firmwareFilePath) {
      return `cannot find firmware`;
    }

    if (firmwareFilePath.endsWith('.atmega32u4.hex')) {
      if (!this.pluggedComPortName) {
        return `target com port unavailable`;
      }
      return await this.schemeAtMega.flashFirmware(
        this.pluggedComPortName,
        firmwareFilePath,
      );
    }
    if (firmwareFilePath.endsWith('.rp2040.uf2')) {
      if (!this.pluggedDriveName) {
        return `target drive unavailable`;
      }
      return await this.schemeRP.flashFirmware(
        this.pluggedDriveName,
        firmwareFilePath,
      );
    }
    return `cannot determine updation method for ${firmwareFilePath}`;
  }
}
