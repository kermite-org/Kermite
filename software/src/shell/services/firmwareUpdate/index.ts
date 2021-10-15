import {
  IBootloaderDeviceDetectionStatus,
  IBootloaderType,
  IFirmwareOriginEx,
  IntervalTimerWrapper,
  IProjectPackageInfo,
  IResourceOrigin,
} from '~/shared';
import { appEnv } from '~/shell/base';
import { withAppErrorHandler } from '~/shell/base/ErrorChecker';
import { createEventPort } from '~/shell/funcs';
import {
  firmwareFileLoader_loadFirmwareFile,
  firmwareFileLoader_loadFirmwareFileByPackageInfo,
} from '~/shell/services/firmwareUpdate/firmwareFileLoader/FirmwareFileLoader';
import { FirmwareUpdateSchemeAtMegaCaterina } from '~/shell/services/firmwareUpdate/flashSchemeAtMegaCaterina/FlashSchemeAtMegaCaterina';
import { FirmwareUpdateSchemeAtMegaDfu } from '~/shell/services/firmwareUpdate/flashSchemeAtmegaDfu/FlashSchemeAtMegaDfu';
import { FirmwareUpdateSchemeRp_Mac } from '~/shell/services/firmwareUpdate/flashSchemeRp/FlashSchemeRp_Mac';
import { FirmwareUpdateSchemeRp_Windows } from '~/shell/services/firmwareUpdate/flashSchemeRp/FlashSchemeRp_Windows';
import { IFirmwareBinaryFileSpec } from '~/shell/services/firmwareUpdate/types';

const FirmwareUpdateSchemeRp =
  appEnv.platform === 'win32'
    ? FirmwareUpdateSchemeRp_Windows
    : FirmwareUpdateSchemeRp_Mac;

export class FirmwareUpdateService {
  private timerWrapper = new IntervalTimerWrapper();

  private schemeAtMegaCaterina = new FirmwareUpdateSchemeAtMegaCaterina();
  private schemeRp = new FirmwareUpdateSchemeRp();
  private schemeAtMegaDfu = new FirmwareUpdateSchemeAtMegaDfu();

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
    const pluggedAvrCaterinaComPortName =
      await this.schemeAtMegaCaterina.updateDeviceDetection();
    if (this.pluggedAvrCaterinaComPortName !== pluggedAvrCaterinaComPortName) {
      this.pluggedAvrCaterinaComPortName = pluggedAvrCaterinaComPortName;
      this.emitDetectionEvent('avrCaterina', pluggedAvrCaterinaComPortName);
    }
    const pluggedRp2040Uf2DriveName =
      await this.schemeRp.updateDeviceDetection();
    if (this.pluggedRp2040Uf2DriveName !== pluggedRp2040Uf2DriveName) {
      this.pluggedRp2040Uf2DriveName = pluggedRp2040Uf2DriveName;
      this.emitDetectionEvent('rp2040uf2', pluggedRp2040Uf2DriveName);
    }
    const pluggedAvrDfuDeviceName =
      await this.schemeAtMegaDfu.updateDeviceDetection();
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

  private async writeFirmwareImpl(
    binarySpec: IFirmwareBinaryFileSpec | undefined,
  ): Promise<'ok' | string> {
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
    return `cannot determine update method for ${binarySpec.filePath}`;
  }

  async writeFirmware(
    origin: IResourceOrigin,
    projectId: string,
    firmwareName: string,
    firmwareOrigin: IFirmwareOriginEx,
  ): Promise<'ok' | string> {
    const binarySpec = await firmwareFileLoader_loadFirmwareFile(
      origin,
      projectId,
      firmwareName,
      firmwareOrigin,
    );
    return await this.writeFirmwareImpl(binarySpec);
  }

  async writeStandardFirmwareDirect(
    packageInfo: IProjectPackageInfo,
    firmwareName: string,
  ): Promise<'ok' | string> {
    const binarySpec = await firmwareFileLoader_loadFirmwareFileByPackageInfo(
      packageInfo,
      firmwareName,
      'online',
    );
    return await this.writeFirmwareImpl(binarySpec);
  }
}
