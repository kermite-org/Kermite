import { useEffect } from 'qx';
import {
  checkDeviceBootloaderMatch,
  getFirmwareTargetDeviceFromBaseFirmwareType,
  IBootloaderDeviceDetectionStatus,
  IProjectPackageInfo,
  IStandardBaseFirmwareType,
} from '~/shared';
import { ipcAgent } from '~/ui/base';
import { modalConfirm, showCommandOutputLogModal } from '~/ui/components';
import { uiActions } from '~/ui/store';

type FirmwareUpdatePhase = 'WaitingReset' | 'WaitingUploadOrder' | 'Uploading';

const state = new (class {
  phase: FirmwareUpdatePhase = 'WaitingReset';
  deviceDetectionStatus: IBootloaderDeviceDetectionStatus = {
    detected: false,
  };

  projectInfo?: IProjectPackageInfo;
  firmwareName?: string;
  baseFirmwareType?: IStandardBaseFirmwareType;
})();

const readers = {
  get detectedDeviceSig(): string | undefined {
    return (
      (state.deviceDetectionStatus.detected &&
        state.deviceDetectionStatus.targetDeviceSig) ||
      undefined
    );
  },
  get canFlashFirmwareToDetectedDevice(): boolean {
    if (state.deviceDetectionStatus.detected && state.baseFirmwareType) {
      const targetDevice = getFirmwareTargetDeviceFromBaseFirmwareType(
        state.baseFirmwareType,
      );
      return (
        !!targetDevice &&
        checkDeviceBootloaderMatch(
          state.deviceDetectionStatus.bootloaderType,
          targetDevice,
        )
      );
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
  // 2: WaitingUploadOrder --> Uploading --> WaitingReset
  async uploadFirmware() {
    if (
      state.phase === 'WaitingUploadOrder' &&
      state.deviceDetectionStatus.detected &&
      state.projectInfo
    ) {
      const { projectInfo } = state;
      const firmwareName = 'default';
      state.phase = 'Uploading';
      uiActions.setLoading();
      const res = await ipcAgent.async.firmup_writeStandardFirmwareDirect(
        projectInfo,
        firmwareName,
      );
      uiActions.clearLoading();
      if (res === 'ok') {
        await modalConfirm({
          message: 'Write Succeeded',
          caption: 'Flash Firmware',
        });
      } else {
        await showCommandOutputLogModal({
          caption: 'Operation Command Log',
          logText: res,
        });
      }
      state.phase = 'WaitingReset';
    }
  },
};

export function standardFirmwareFlashPartModel_configure(
  projectInfo: IProjectPackageInfo,
  firmwareName: string,
  baseFirmwareType: IStandardBaseFirmwareType,
) {
  state.projectInfo = projectInfo;
  state.firmwareName = firmwareName;
  state.baseFirmwareType = baseFirmwareType;
}

export function useStandardFirmwareFlashPartModel() {
  useEffect(
    () =>
      ipcAgent.events.firmup_deviceDetectionEvents.subscribe(
        actions.setDeviceStatus,
      ),
    [],
  );
  const { detectedDeviceSig, canFlashFirmwareToDetectedDevice } = readers;
  const { uploadFirmware } = actions;
  return {
    phase: state.phase,
    detectedDeviceSig,
    canFlashFirmwareToDetectedDevice,
    onWriteButton: uploadFirmware,
  };
}
