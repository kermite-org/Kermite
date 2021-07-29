import { useEffect } from 'qx';
import { ISelectorSource } from '~/ui/base';
import { showCommandOutputLogModal } from '~/ui/components';
import {
  firmwareUpdationModel,
  FirmwareUpdationPhase,
} from './FirmwareUpdationModel';

interface IFirmwareUpdationPartModel {
  phase: FirmwareUpdationPhase;
  detectedDeviceSig: string | undefined;
  canSelectTargetFirmware: boolean;
  projectSelectorSource: ISelectorSource;
  canFlashSelectedFirmwareToDetectedDevice: boolean;
  onWriteButton(): void;
  onResetButton(): void;
  onLogButton(): void;
}

export function useFirmwareUpdationPartModel(): IFirmwareUpdationPartModel {
  const model = firmwareUpdationModel;
  useEffect(model.startPageSession, []);
  return {
    phase: model.phase,
    detectedDeviceSig: model.detectedDeviceSig,
    canSelectTargetFirmware: model.canSelectTargetFirmware,
    projectSelectorSource: {
      options: model.projectOptions,
      value: model.currentProjectFirmwareSpec,
      setValue: model.setCurrentProjectFirmwareSpec,
    },
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
