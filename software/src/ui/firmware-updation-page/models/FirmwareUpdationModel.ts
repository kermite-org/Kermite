import {
  flattenArray,
  IBootloaderDeviceDetectionStatus,
  IBootloaderType,
  IFirmwareTargetDevice,
  IProjectResourceInfo,
  sortOrderBy,
} from '~/shared';
import { ipcAgent, modalAlert } from '~/ui/common';

export type FirmwareUpdationPhase =
  | 'WaitingReset'
  | 'WaitingUploadOrder'
  | 'Uploading'
  | 'UploadSuccess'
  | 'UploadFailure';

function checkDeviceBootloaderMatch(
  bootloaderType: IBootloaderType,
  firmwareTargetDevice: IFirmwareTargetDevice,
): boolean {
  const isBootloaderAvr =
    bootloaderType === 'avrCaterina' || bootloaderType === 'avrDfu';
  const isBootloaderRp2040 = bootloaderType === 'rp2040uf2';
  return (
    (isBootloaderAvr && firmwareTargetDevice === 'atmega32u4') ||
    (isBootloaderRp2040 && firmwareTargetDevice === 'rp2040')
  );
}
export class FirmwareUpdationModel {
  currentProjectFirmwareSpec: string = '';
  phase: FirmwareUpdationPhase = 'WaitingReset';

  firmwareUploadResult: string | undefined = undefined;

  private projectInfosWithFirmware: IProjectResourceInfo[] = [];

  private deviceDetectionStatus: IBootloaderDeviceDetectionStatus = {
    detected: false,
  };

  get detectedDeviceSig(): string | undefined {
    return (
      (this.deviceDetectionStatus.detected &&
        this.deviceDetectionStatus.targetDeviceSig) ||
      undefined
    );
  }

  setCurrentProjectFirmwareSpec = (spec: string) => {
    this.currentProjectFirmwareSpec = spec;
  };

  get projectOptions() {
    const blankOption = { value: '', label: 'select firmware' };
    const projectOptions = flattenArray(
      this.projectInfosWithFirmware.map((info) =>
        info.firmwares.map((firmware) => ({
          value: `${info.sig}:${firmware.variationName}`,
          label: `${info.origin === 'local' ? '[L]' : '[R]'} ${
            info.keyboardName
          } (${info.projectPath} ${firmware.variationName})`,
        })),
      ),
    );
    return [blankOption, ...projectOptions];
  }

  get canSelectTargetFirmware() {
    const { phase } = this;
    return phase === 'WaitingReset' || phase === 'WaitingUploadOrder';
  }

  // 0: WaitingReset
  backToInitialPhase = () => {
    this.phase = 'WaitingReset';
  };

  // 1: WaitingReset --> WaitingUploadOrder
  private onDeviceDetectionEvent = (ev: IBootloaderDeviceDetectionStatus) => {
    this.deviceDetectionStatus = ev;
    if (this.phase === 'WaitingReset' && this.deviceDetectionStatus.detected) {
      this.phase = 'WaitingUploadOrder';
    }
    if (
      this.phase === 'WaitingUploadOrder' &&
      !this.deviceDetectionStatus.detected
    ) {
      this.phase = 'WaitingReset';
    }
  };

  get canFlashSelectedFirmwareToDetectedDevice(): boolean {
    if (this.deviceDetectionStatus.detected) {
      const [projectSig, variationName] = this.currentProjectFirmwareSpec.split(
        ':',
      );
      const projectaInfo = this.projectInfosWithFirmware.find((it) =>
        it.sig.startsWith(projectSig),
      );
      const firmwareInfo = projectaInfo?.firmwares.find(
        (f) => f.variationName === variationName,
      );
      if (firmwareInfo) {
        return checkDeviceBootloaderMatch(
          this.deviceDetectionStatus.bootloaderType,
          firmwareInfo.targetDevice,
        );
      }
    }
    return false;
  }

  // 2: WaitingUploadOrder --> Uploading --> UploadSuccess,UploadFailure
  uploadFirmware = async () => {
    if (!this.currentProjectFirmwareSpec) {
      await modalAlert('please select firmware');
      return;
    }
    if (
      this.phase === 'WaitingUploadOrder' &&
      this.deviceDetectionStatus.detected
    ) {
      const [projectSig, variationName] = this.currentProjectFirmwareSpec.split(
        ':',
      );
      const info = this.projectInfosWithFirmware.find((it) =>
        it.sig.startsWith(projectSig),
      );
      if (info) {
        this.phase = 'Uploading';
        const res = await ipcAgent.async.firmup_uploadFirmware(
          info.origin,
          info.projectId,
          variationName,
        );
        this.firmwareUploadResult = res;
        if (res === 'ok') {
          this.phase = 'UploadSuccess';
        } else {
          this.phase = 'UploadFailure';
        }
      }
    }
  };

  private async fechProjectInfos() {
    const projectResourceInfos = await ipcAgent.async.projects_getAllProjectResourceInfos();
    this.projectInfosWithFirmware = projectResourceInfos
      .filter((info) => info.firmwares.length > 0)
      .sort(
        sortOrderBy((it) => `${it.origin}${it.keyboardName}${it.projectPath}`),
      );
  }

  startPageSession = () => {
    this.fechProjectInfos();
    return ipcAgent.events.firmup_deviceDetectionEvents.subscribe(
      this.onDeviceDetectionEvent,
    );
  };
}

export const firmwareUpdationModel = new FirmwareUpdationModel();
