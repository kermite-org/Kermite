import { useEffect } from 'qx';
import { ISelectorSource } from '~/ui/base';
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
}

export function useFirmwareUpdatePartModel(): IFirmwareUpdatePartModel {
  const model = firmwareUpdateModel;
  useEffect(model.startPageSession, []);
  return {
    phase: model.phase,
    detectedDeviceSig: model.detectedDeviceSig,
    canSelectTargetFirmware: model.canSelectTargetFirmware,
    firmwareSelectorSource: model.getFirmwareSelectionSource(),
    get canFlashSelectedFirmwareToDetectedDevice() {
      return model.canFlashSelectedFirmwareToDetectedDevice;
    },
    onWriteButton() {
      model.uploadFirmware();
    },
    onResetButton() {
      model.backToInitialPhase();
    },
    onLogButton() {
      showCommandOutputLogModal({
        caption: 'Operation Command Log',
        logText: model.firmwareUploadResult || '',
      });
    },
  };
}
