import { models } from '~/models';
import { FirmwareUpdationPhase } from '~/models/FirmwareUpdationModel';
import { ISelectorSource } from '~/viewModels/viewModelInterfaces';
import { showCommandOutputLogModal } from '~/views/base/modal/CommandOutputLogModal';

interface IFirmwareUpdationPageViewModel {
  phase: FirmwareUpdationPhase;
  comPortName: string | undefined;
  canSelectTargetFirmware: boolean;
  projectSelectorSource: ISelectorSource;
  onWriteButton(): void;
  onResetButton(): void;
  onLogButton(): void;
}

export function makeFirmwareUpdationPageViewModel(): IFirmwareUpdationPageViewModel {
  const model = models.firmwareUpdationModel;
  return {
    phase: model.phase,
    comPortName: model.comPortName,
    canSelectTargetFirmware: model.canSelectTargetFirmware,
    projectSelectorSource: {
      options: model.projectOptions,
      choiceId: model.currentProjectId,
      setChoiceId: model.setCurrentProjectId,
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
