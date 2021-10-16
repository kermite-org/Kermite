import { useEffect } from 'qx';
import {
  checkDeviceBootloaderMatch,
  getFirmwareTargetDeviceFromBaseFirmwareType,
  IBootloaderDeviceDetectionStatus,
} from '~/shared';
import { ipcAgent } from '~/ui/base';
import { modalConfirm, showCommandOutputLogModal } from '~/ui/components';
import { projectQuickSetupStore } from '~/ui/features/ProjectQuickSetupPart/base/ProjectQuickSetupStore';
import { uiActions } from '~/ui/store';

type FirmwareUpdatePhase = 'WaitingReset' | 'WaitingUploadOrder' | 'Uploading';

const state = new (class {
  phase: FirmwareUpdatePhase = 'WaitingReset';
  deviceDetectionStatus: IBootloaderDeviceDetectionStatus = {
    detected: false,
  };
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
    if (state.deviceDetectionStatus.detected) {
      const { firmwareConfig } = projectQuickSetupStore.state;
      const targetDevice = getFirmwareTargetDeviceFromBaseFirmwareType(
        firmwareConfig.baseFirmwareType,
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
      state.deviceDetectionStatus.detected
    ) {
      const projectInfo = projectQuickSetupStore.readers.emitDraftProjectInfo();
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

export function useFirmwareFlashSectionModel() {
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
