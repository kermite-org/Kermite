import { useEffect } from 'alumina';
import {
  checkDeviceBootloaderMatch,
  IBootloaderDeviceDetectionStatus,
  IFirmwareTargetDevice,
  IProjectPackageInfo,
} from '~/shared';
import { ipcAgent } from '~/ui/base';
import { getFirmwareTargetDeviceType } from '~/ui/commonModels';
import { modalConfirm, showCommandOutputLogModal } from '~/ui/components';
import { uiActions } from '~/ui/store';

type FirmwareUpdatePhase = 'WaitingReset' | 'WaitingUploadOrder' | 'Uploading';

const state = new (class {
  phase: FirmwareUpdatePhase = 'WaitingReset';
  deviceDetectionStatus: IBootloaderDeviceDetectionStatus = {
    detected: false,
  };

  projectInfo?: IProjectPackageInfo;
  variationId?: string;
  targetDeviceType?: IFirmwareTargetDevice;
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
    if (state.deviceDetectionStatus.detected && state.targetDeviceType) {
      return checkDeviceBootloaderMatch(
        state.deviceDetectionStatus.bootloaderType,
        state.targetDeviceType,
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
      state.projectInfo &&
      state.variationId
    ) {
      const { projectInfo, variationId } = state;
      state.phase = 'Uploading';
      uiActions.setLoading();
      const res = await ipcAgent.async.firmup_writeStandardFirmwareDirect(
        projectInfo,
        variationId,
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

type IStandardFirmwareFlashPartModel = {
  phase: FirmwareUpdatePhase;
  detectedDeviceSig: string | undefined;
  canFlashFirmwareToDetectedDevice: boolean;
  onWriteButton(): void;
  targetDeviceType: IFirmwareTargetDevice | undefined;
};

export function useStandardFirmwareFlashPartModel(
  projectInfo: IProjectPackageInfo,
  variationId: string,
): IStandardFirmwareFlashPartModel {
  useEffect(() => {
    state.projectInfo = projectInfo;
    state.variationId = variationId;
    state.targetDeviceType = getFirmwareTargetDeviceType(
      projectInfo,
      variationId,
    );
  }, [projectInfo, variationId]);

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
    targetDeviceType: state.targetDeviceType,
  };
}
