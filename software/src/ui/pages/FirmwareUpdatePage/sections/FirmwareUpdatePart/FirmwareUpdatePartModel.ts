import { useEffect } from 'alumina';
import { ipcAgent, ISelectorSource } from '~/ui/base';
import { showCommandOutputLogModal } from '~/ui/components';
import {
  firmwareUpdateModel,
  FirmwareUpdatePhase,
} from './FirmwareUpdateModel';

interface IFirmwareUpdatePartModel {
  phase: FirmwareUpdatePhase;
  detectedDeviceSig: string | undefined;
  canSelectTargetFirmware: boolean;
  firmwareSelectorSource: ISelectorSource;
  canFlashSelectedFirmwareToDetectedDevice: boolean;
  onWriteButton(): void;
  onResetButton(): void;
  onLogButton(): void;
  isFirmwareSelected: boolean;
  onDownloadButton(): void;
}

export function useFirmwareUpdatePartModel(): IFirmwareUpdatePartModel {
  const model = firmwareUpdateModel;

  const { state, readers, actions } = model;
  useEffect(
    () =>
      ipcAgent.events.firmup_deviceDetectionEvents.subscribe(
        actions.setDeviceStatus,
      ),
    [],
  );

  return {
    phase: state.phase,
    detectedDeviceSig: readers.detectedDeviceSig,
    canSelectTargetFirmware: readers.canSelectTargetFirmware,
    firmwareSelectorSource: readers.getFirmwareSelectionSource(),
    get canFlashSelectedFirmwareToDetectedDevice() {
      return readers.canFlashSelectedFirmwareToDetectedDevice;
    },
    onWriteButton() {
      actions.uploadFirmware();
    },
    onResetButton() {
      actions.backToInitialPhase();
    },
    onLogButton() {
      showCommandOutputLogModal({
        caption: 'Operation Command Log',
        logText: state.firmwareUploadResult || '',
      });
    },
    isFirmwareSelected: !!state.currentProjectFirmwareSpec,
    onDownloadButton() {
      actions.downloadFirmwareUf2File();
    },
  };
}
