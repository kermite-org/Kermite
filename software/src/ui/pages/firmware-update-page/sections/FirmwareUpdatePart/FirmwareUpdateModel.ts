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

const state = new (class {
  currentProjectFirmwareSpec: string = ''; // `${projectKey}:${firmwareName}`
  phase: FirmwareUpdatePhase = 'WaitingReset';
  firmwareUploadResult: string | undefined = undefined;
  deviceDetectionStatus: IBootloaderDeviceDetectionStatus = {
    detected: false,
  };
})();

const readers = {
  get projectInfosWithFirmware(): IProjectPackageInfo[] {
    return projectPackagesReader
      .getProjectInfosGlobalProjectSelectionAffected()
      .filter((info) => info.firmwares.length > 0);
  },

  get detectedDeviceSig(): string | undefined {
    return (
      (state.deviceDetectionStatus.detected &&
        state.deviceDetectionStatus.targetDeviceSig) ||
      undefined
    );
  },
  get firmwareOptions() {
    const blankOption = { value: '', label: 'select firmware' };
    const _firmwareOptions = flattenArray(
      readers.projectInfosWithFirmware.map((info) =>
        info.firmwares.map((firmware) => ({
          value: `${info.projectKey}:${firmware.firmwareName}`,
          label: `${info.origin === 'local' ? '(local) ' : ''} ${
            info.keyboardName
          } (${firmware.firmwareName})`,
        })),
      ),
    );
    return [blankOption, ..._firmwareOptions];
  },
  getFirmwareSelectionSource(): ISelectorSource {
    if (
      !readers.firmwareOptions.some(
        (option) => option.value === state.currentProjectFirmwareSpec,
      )
    ) {
      state.currentProjectFirmwareSpec = '';
    }
    return {
      options: readers.firmwareOptions,
      value: state.currentProjectFirmwareSpec,
      setValue: (spec: string) => (state.currentProjectFirmwareSpec = spec),
    };
  },
  get canSelectTargetFirmware() {
    const { phase } = state;
    return phase === 'WaitingReset' || phase === 'WaitingUploadOrder';
  },
  get canFlashSelectedFirmwareToDetectedDevice(): boolean {
    if (state.deviceDetectionStatus.detected) {
      const [projectKey, firmwareName] =
        state.currentProjectFirmwareSpec.split(':');
      const projectInfo = readers.projectInfosWithFirmware.find((it) =>
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
            state.deviceDetectionStatus.bootloaderType,
            targetDevice,
          )
        );
      }
    }
    return false;
  },
};

const actions = {
  // 0: WaitingReset
  backToInitialPhase() {
    state.phase = 'WaitingReset';
  },

  // 1: WaitingReset --> WaitingUploadOrder
  setDeviceStatus(deviceDetectionStatus: IBootloaderDeviceDetectionStatus) {
    state.deviceDetectionStatus = deviceDetectionStatus;
    if (
      state.phase === 'WaitingReset' &&
      state.deviceDetectionStatus.detected
    ) {
      state.phase = 'WaitingUploadOrder';
    }
    if (
      state.phase === 'WaitingUploadOrder' &&
      !state.deviceDetectionStatus.detected
    ) {
      state.phase = 'WaitingReset';
    }
  },

  // 2: WaitingUploadOrder --> Uploading --> UploadSuccess,UploadFailure
  async uploadFirmware() {
    if (!state.currentProjectFirmwareSpec) {
      await modalAlert('please select firmware');
      return;
    }
    if (
      state.phase === 'WaitingUploadOrder' &&
      state.deviceDetectionStatus.detected
    ) {
      const [projectKey, firmwareName] =
        state.currentProjectFirmwareSpec.split(':');
      const info = readers.projectInfosWithFirmware.find((it) =>
        it.projectKey.startsWith(projectKey),
      );
      if (info) {
        state.phase = 'Uploading';
        uiActions.setLoading();
        const res = await ipcAgent.async.firmup_uploadFirmware(
          info.origin,
          info.projectId,
          firmwareName,
        );
        uiActions.clearLoading();
        state.firmwareUploadResult = res;
        if (res === 'ok') {
          state.phase = 'UploadSuccess';
        } else {
          state.phase = 'UploadFailure';
        }
      }
    }
  },
};

export const firmwareUpdateModel = {
  state,
  readers,
  actions,
};
