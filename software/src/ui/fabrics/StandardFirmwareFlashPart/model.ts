import { useEffect } from 'qx';
import {
  checkDeviceBootloaderMatch,
  getFirmwareTargetDeviceFromBaseFirmwareType,
  IBootloaderDeviceDetectionStatus,
  IFirmwareTargetDevice,
  IProjectPackageInfo,
} from '~/shared';
import { ipcAgent } from '~/ui/base';
import { modalConfirm, showCommandOutputLogModal } from '~/ui/components';
import { uiActions, uiReaders } from '~/ui/store';

type FirmwareUpdatePhase = 'WaitingReset' | 'WaitingUploadOrder' | 'Uploading';

const state = new (class {
  phase: FirmwareUpdatePhase = 'WaitingReset';
  deviceDetectionStatus: IBootloaderDeviceDetectionStatus = {
    detected: false,
  };

  projectInfo?: IProjectPackageInfo;
  firmwareVariationId?: string;
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
      state.firmwareVariationId
    ) {
      const { projectInfo, firmwareVariationId } = state;
      state.phase = 'Uploading';
      uiActions.setLoading();
      const res = await ipcAgent.async.firmup_writeStandardFirmwareDirect(
        projectInfo,
        firmwareVariationId,
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

function getFirmwareTargetDeviceType(
  projectInfo: IProjectPackageInfo,
  firmwareVariationId: string,
): IFirmwareTargetDevice | undefined {
  const firmwareEntry = projectInfo.firmwares.find(
    (it) => it.variationId === firmwareVariationId,
  );
  if (firmwareEntry) {
    if (firmwareEntry.type === 'standard') {
      return getFirmwareTargetDeviceFromBaseFirmwareType(
        firmwareEntry.standardFirmwareConfig.baseFirmwareType,
      );
    } else {
      const customFirmwareInfo = uiReaders.allCustomFirmwareInfos.find(
        (it) => it.firmwareId,
      );
      return customFirmwareInfo?.targetDevice;
    }
  }
}

type IStandardFirmwareFlashPartModel = {
  phase: FirmwareUpdatePhase;
  detectedDeviceSig: string | undefined;
  canFlashFirmwareToDetectedDevice: boolean;
  onWriteButton(): void;
  targetDeviceType: IFirmwareTargetDevice | undefined;
};

export function useStandardFirmwareFlashPartModel(
  projectInfo: IProjectPackageInfo,
  firmwareVariationId: string,
): IStandardFirmwareFlashPartModel {
  useEffect(() => {
    state.projectInfo = projectInfo;
    state.firmwareVariationId = firmwareVariationId;
    state.targetDeviceType = getFirmwareTargetDeviceType(
      projectInfo,
      firmwareVariationId,
    );
  }, [projectInfo, firmwareVariationId]);

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
