import { ISelectorSource } from '~/ui-common';
import { showCommandOutputLogModal } from './CommandOutputLogModal';
import {
  firmwareUpdationModel,
  FirmwareUpdationPhase,
} from './FirmwareUpdationModel';

interface IFirmwareUpdationPageViewModel {
  phase: FirmwareUpdationPhase;
  detectedDeviceSig: string | undefined;
  canSelectTargetFirmware: boolean;
  projectSelectorSource: ISelectorSource;
  onWriteButton(): void;
  onResetButton(): void;
  onLogButton(): void;
}

export function makeFirmwareUpdationPageViewModel(): IFirmwareUpdationPageViewModel {
  const model = firmwareUpdationModel;
  return {
    phase: model.phase,
    detectedDeviceSig: model.detectedDeviceSig,
    canSelectTargetFirmware: model.canSelectTargetFirmware,
    projectSelectorSource: {
      options: model.projectOptions,
      value: model.currentProjectFirmwareSpec,
      setValue: model.setCurrentProjectFirmwareSpec,
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
