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
import { FirmwareUpdationSchemeAtMegaCaterina } from '~/shell/services/firmwareUpdation/flashSchemeAtMegaCaterina/FlashSchemeAtMegaCaterina';
import { FirmwareUpdationSchemeAtMegaDfu } from '~/shell/services/firmwareUpdation/flashSchemeAtmegaDfu/FlashSchemeAtMegaDfu';
import { FirmwareUpdationSchemeRp_Mac } from '~/shell/services/firmwareUpdation/flashSchemeRp/FlashSchemeRp_Mac';
import { FirmwareUpdationSchemeRp_Windows } from '~/shell/services/firmwareUpdation/flashSchemeRp/FlashSchemeRp_Windows';

const FirmwareUpdationSchemeRp =
  appEnv.platform === 'win32'
    ? FirmwareUpdationSchemeRp_Windows
    : FirmwareUpdationSchemeRp_Mac;

export class FirmwareUpdationService {
  private timerWrapper = new IntervalTimerWrapper();

  private schemeAtMegaCaterina = new FirmwareUpdationSchemeAtMegaCaterina();
  private schemeRp = new FirmwareUpdationSchemeRp();
  private schemeAtMegaDfu = new FirmwareUpdationSchemeAtMegaDfu();

  private pluggedAvrCaterinaComPortName: string | undefined;
  private pluggedRp2040Uf2DriveName: string | undefined;
  private pluggedAvrDfuDeviceName: string | undefined;

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
    const pluggedAvrCaterinaComPortName = await this.schemeAtMegaCaterina.updateDeviceDetection();
    if (this.pluggedAvrCaterinaComPortName !== pluggedAvrCaterinaComPortName) {
      this.pluggedAvrCaterinaComPortName = pluggedAvrCaterinaComPortName;
      this.emitDetectionEvent('avrCaterina', pluggedAvrCaterinaComPortName);
    }
    const pluggedRp2040Uf2DriveName = await this.schemeRp.updateDeviceDetection();
    if (this.pluggedRp2040Uf2DriveName !== pluggedRp2040Uf2DriveName) {
      this.pluggedRp2040Uf2DriveName = pluggedRp2040Uf2DriveName;
      this.emitDetectionEvent('rp2040uf2', pluggedRp2040Uf2DriveName);
    }
    const pluggedAvrDfuDeviceName = await this.schemeAtMegaDfu.updateDeviceDetection();
    if (this.pluggedAvrDfuDeviceName !== pluggedAvrDfuDeviceName) {
      this.pluggedAvrDfuDeviceName = pluggedAvrDfuDeviceName;
      this.emitDetectionEvent('avrDfu', pluggedAvrDfuDeviceName);
    }
  };

  private startDetection() {
    this.pluggedAvrCaterinaComPortName = undefined;
    this.schemeAtMegaCaterina.resetDeviceDetectionStatus();
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
      if (this.pluggedAvrCaterinaComPortName) {
        return await this.schemeAtMegaCaterina.flashFirmware(
          this.pluggedAvrCaterinaComPortName,
          binarySpec.filePath,
        );
      }
      if (this.pluggedAvrDfuDeviceName) {
        return await this.schemeAtMegaDfu.flashFirmware(
          this.pluggedAvrDfuDeviceName,
          binarySpec.filePath,
        );
      }
      return 'target device unavailable';
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
