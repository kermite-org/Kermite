import { Hook } from 'qx';
import { ISelectorSource } from '~/ui-common';
import { showCommandOutputLogModal } from '~/ui-firmware-updation-page/modals';
import {
  firmwareUpdationModel,
  FirmwareUpdationPhase,
} from './FirmwareUpdationModel';

interface IFirmwareUpdationPartModel {
  phase: FirmwareUpdationPhase;
  detectedDeviceSig: string | undefined;
  canSelectTargetFirmware: boolean;
  projectSelectorSource: ISelectorSource;
  onWriteButton(): void;
  onResetButton(): void;
  onLogButton(): void;
}

export function useFirmwareUpdationPartModel(): IFirmwareUpdationPartModel {
  const model = firmwareUpdationModel;
  Hook.useEffect(model.startPageSession, []);
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
