import {
  checkDeviceBootloaderMatch,
  flattenArray,
  getFirmwareTargetDeviceFromBaseFirmwareType,
  IBootloaderDeviceDetectionStatus,
  IFirmwareTargetDevice,
  IProjectFirmwareEntry,
  IProjectPackageInfo,
} from '~/shared';
import { ipcAgent, ISelectorSource } from '~/ui/base';
import { modalAlert } from '~/ui/components';
import { projectPackagesReader, uiActions, uiReaders } from '~/ui/store';

export type FirmwareUpdatePhase =
  | 'WaitingReset'
  | 'WaitingUploadOrder'
  | 'Uploading'
  | 'UploadSuccess'
  | 'UploadFailure';

function getTargetDeviceFromFirmwareInfo(
  entry: IProjectFirmwareEntry,
): IFirmwareTargetDevice | undefined {
  if (entry.type === 'standard') {
    return getFirmwareTargetDeviceFromBaseFirmwareType(
      entry.standardFirmwareConfig.baseFirmwareType,
    );
  }
  if (entry.type === 'custom') {
    const item = uiReaders.allCustomFirmwareInfos.find(
      (it) => it.firmwareId === entry.customFirmwareId,
    );
    return item?.targetDevice as IFirmwareTargetDevice;
  }
  return undefined;
}
export class FirmwareUpdateModel {
  currentProjectFirmwareSpec: string = '';
  phase: FirmwareUpdatePhase = 'WaitingReset';

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

  get firmwareOptions() {
    const blankOption = { value: '', label: 'select firmware' };
    const _firmwareOptions = flattenArray(
      this.projectInfosWithFirmware.map((info) =>
        info.firmwares.map((firmware) => ({
          value: `${info.projectKey}:${firmware.firmwareName}`,
          label: `${info.origin === 'local' ? '(local) ' : ''} ${
            info.keyboardName
          } (${firmware.firmwareName})`,
        })),
      ),
    );
    return [blankOption, ..._firmwareOptions];
  }

  getFirmwareSelectionSource(): ISelectorSource {
    if (
      !this.firmwareOptions.some(
        (option) => option.value === this.currentProjectFirmwareSpec,
      )
    ) {
      this.currentProjectFirmwareSpec = '';
    }
    return {
      options: this.firmwareOptions,
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
      const [projectKey, firmwareName] =
        this.currentProjectFirmwareSpec.split(':');
      const projectInfo = this.projectInfosWithFirmware.find((it) =>
        it.projectKey.startsWith(projectKey),
      );
      const firmwareInfo = projectInfo?.firmwares.find(
        (f) => f.firmwareName === firmwareName,
      );
      if (firmwareInfo) {
        const targetDevice = getTargetDeviceFromFirmwareInfo(firmwareInfo);
        return (
          !!targetDevice &&
          checkDeviceBootloaderMatch(
            this.deviceDetectionStatus.bootloaderType,
            targetDevice,
          )
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
      const [projectKey, firmwareName] =
        this.currentProjectFirmwareSpec.split(':');
      const info = this.projectInfosWithFirmware.find((it) =>
        it.projectKey.startsWith(projectKey),
      );
      if (info) {
        this.phase = 'Uploading';
        uiActions.setLoading();
        const res = await ipcAgent.async.firmup_uploadFirmware(
          info.origin,
          info.projectId,
          firmwareName,
        );
        uiActions.clearLoading();
        this.firmwareUploadResult = res;
        if (res === 'ok') {
          this.phase = 'UploadSuccess';
        } else {
          this.phase = 'UploadFailure';
        }
      }
    }
  };

  private fetchProjectInfos() {
    this.projectInfosWithFirmware = projectPackagesReader
      .getProjectInfosGlobalProjectSelectionAffected()
      .filter((info) => info.firmwares.length > 0);
  }

  startPageSession = () => {
    this.fetchProjectInfos();
    return ipcAgent.events.firmup_deviceDetectionEvents.subscribe(
      this.onDeviceDetectionEvent,
    );
  };
}

export const firmwareUpdateModel = new FirmwareUpdateModel();
