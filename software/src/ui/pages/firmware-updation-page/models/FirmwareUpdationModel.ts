import {
  flattenArray,
  IBootloaderDeviceDetectionStatus,
  IBootloaderType,
  IFirmwareTargetDevice,
  IProjectPackageInfo,
  IStandardBaseFirmwareType,
} from '~/shared';
import { ipcAgent, ISelectorSource } from '~/ui/base';
import { projectPackagesReader, uiStatusModel } from '~/ui/commonModels';
import { modalAlert } from '~/ui/components';

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

function getFirmwareTargetDeviceFromBaseFirmwareType(
  baseFirmwareType: IStandardBaseFirmwareType,
): IFirmwareTargetDevice {
  if (baseFirmwareType === 'AvrUnified' || baseFirmwareType === 'AvrSplit') {
    return 'atmega32u4';
  } else {
    return 'rp2040';
  }
}
export class FirmwareUpdationModel {
  currentProjectFirmwareSpec: string = '';
  phase: FirmwareUpdationPhase = 'WaitingReset';

  firmwareUploadResult: string | undefined = undefined;

  private projectInfosWithFirmware: IProjectPackageInfo[] = [];

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
        info.standardFirmwareDefinitions.map((firmware) => ({
          value: `${info.sig}:${firmware.variantName}`,
          label: `${info.origin === 'local' ? '(local) ' : ''} ${
            info.keyboardName
          } (${firmware.variantName})`,
        })),
      ),
    );
    return [blankOption, ...projectOptions];
  }

  getProjectSelectionSource(): ISelectorSource {
    if (
      !this.projectOptions.some(
        (option) => option.value === this.currentProjectFirmwareSpec,
      )
    ) {
      this.currentProjectFirmwareSpec = '';
    }
    return {
      options: this.projectOptions,
      value: this.currentProjectFirmwareSpec,
      setValue: this.setCurrentProjectFirmwareSpec,
    };
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
      const firmwareInfo = projectaInfo?.standardFirmwareDefinitions.find(
        (f) => f.variantName === variationName,
      );
      if (firmwareInfo) {
        const targetDevice = getFirmwareTargetDeviceFromBaseFirmwareType(
          firmwareInfo.data.baseFirmwareType,
        );
        return checkDeviceBootloaderMatch(
          this.deviceDetectionStatus.bootloaderType,
          targetDevice,
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
        uiStatusModel.setLoading();
        const res = await ipcAgent.async.firmup_uploadFirmware(
          info.origin,
          info.projectId,
          variationName,
        );
        uiStatusModel.clearLoading();
        this.firmwareUploadResult = res;
        if (res === 'ok') {
          this.phase = 'UploadSuccess';
        } else {
          this.phase = 'UploadFailure';
        }
      }
    }
  };

  private fechProjectInfos() {
    this.projectInfosWithFirmware = projectPackagesReader
      .getProjectInfosGlobalProjectSelectionAffected()
      .filter((info) => info.standardFirmwareDefinitions.length > 0);
  }

  startPageSession = () => {
    this.fechProjectInfos();
    return ipcAgent.events.firmup_deviceDetectionEvents.subscribe(
      this.onDeviceDetectionEvent,
    );
  };
}

export const firmwareUpdationModel = new FirmwareUpdationModel();
