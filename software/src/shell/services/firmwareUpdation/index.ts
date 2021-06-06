import {
  IBootloaderDeviceDetectionStatus,
  IBootloaderType,
  IntervalTimerWrapper,
  IResourceOrigin,
} from '~/shared';
import { appEnv } from '~/shell/base';
import { withAppErrorHandler } from '~/shell/base/ErrorChecker';
import { createEventPort } from '~/shell/funcs';
import { projectResourceProvider } from '~/shell/projectResources';
import { FirmwareUpdationSchemeAtMega } from '~/shell/services/firmwareUpdation/flashSchemeAtMega/FlashSchemeAtMega';
import { FirmwareUpdationSchemeRp_Mac } from '~/shell/services/firmwareUpdation/flashSchemeRp/FlashSchemeRp_Mac';
import { FirmwareUpdationSchemeRp_Windows } from '~/shell/services/firmwareUpdation/flashSchemeRp/FlashSchemeRp_Windows';

const FirmwareUpdationSchemeRp =
  appEnv.platform === 'win32'
    ? FirmwareUpdationSchemeRp_Windows
    : FirmwareUpdationSchemeRp_Mac;

export class FirmwareUpdationService {
  private timerWrapper = new IntervalTimerWrapper();

  private schemeAtMega = new FirmwareUpdationSchemeAtMega();
  private schemeRp = new FirmwareUpdationSchemeRp();

  private pluggedAvrCaterinaComPortName: string | undefined;
  private pluggedRp2040Uf2DriveName: string | undefined;

  deviceDetectionEvents = createEventPort<IBootloaderDeviceDetectionStatus>({
    onFirstSubscriptionStarting: () => this.startDetection(),
    onLastSubscriptionEnded: () => this.stopDetection(),
  });

  private emitDetectionEvent(
    bootloaderType: IBootloaderType,
    targetDeviceSig: string | undefined,
  ) {
    // console.log({ bootloaderType, targetDeviceSig });
    if (targetDeviceSig) {
      this.deviceDetectionEvents.emit({
        detected: true,
        bootloaderType,
        targetDeviceSig,
      });
    } else {
      this.deviceDetectionEvents.emit({ detected: false });
    }
  }

  private updateDetection = async () => {
    const pluggedComPortName = await this.schemeAtMega.updateDeviceDetection();
    if (this.pluggedAvrCaterinaComPortName !== pluggedComPortName) {
      this.pluggedAvrCaterinaComPortName = pluggedComPortName;
      this.emitDetectionEvent('avrCaterina', pluggedComPortName);
    }
    const pluggedDriveName = await this.schemeRp.updateDeviceDetection();
    if (this.pluggedRp2040Uf2DriveName !== pluggedDriveName) {
      this.pluggedRp2040Uf2DriveName = pluggedDriveName;
      this.emitDetectionEvent('rp2040uf2', pluggedDriveName);
    }
  };

  private startDetection() {
    this.pluggedAvrCaterinaComPortName = undefined;
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
      if (!this.pluggedAvrCaterinaComPortName) {
        return `target com port unavailable`;
      }
      return await this.schemeAtMega.flashFirmware(
        this.pluggedAvrCaterinaComPortName,
        binarySpec.filePath,
      );
    }
    if (binarySpec.targetDevice === 'rp2040') {
      if (!this.pluggedRp2040Uf2DriveName) {
        return `target drive unavailable`;
      }
      return await this.schemeRp.flashFirmware(
        this.pluggedRp2040Uf2DriveName,
        binarySpec.filePath,
      );
    }
    return `cannot determine updation method for ${binarySpec.filePath}`;
  }
}
