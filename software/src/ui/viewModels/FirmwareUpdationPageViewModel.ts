import { Models } from '~ui/models';
import { FirmwareUpdationModel } from '~ui/models/FirmwareUpdationModel';
import { ISelectorSource } from '~ui/viewModels/viewModelInterfaces';
import { showCommandOutputLogModal } from '~ui/views/base/modal/CommandOutputLogModal';

export class FirmwareUpdationPageViewModel {
  private currentProjectId: string = '';
  private model: FirmwareUpdationModel;

  constructor(private models: Models) {
    this.model = models.firmwareUpdationModel;
  }

  get phase() {
    return this.model.phase;
  }

  get comPortName() {
    return this.model.comPortName;
  }

  get canSelectTargetFirmware() {
    const { phase } = this.model;
    return phase === 'WaitingReset' || phase === 'WaitingUploadOrder';
  }

  get projectSelectorSource(): ISelectorSource {
    const blankOption = { id: '', text: 'select firmware' };
    const projectOptions = this.models.projectResourceModel
      .getProjectsWithFirmware()
      .map((info) => ({
        id: info.projectId,
        text: info.projectPath
      }));
    return {
      options: [blankOption, ...projectOptions],
      choiceId: this.currentProjectId,
      setChoiceId: (id) => {
        this.currentProjectId = id;
      }
    };
  }

  onWriteButton = () => {
    if (!this.currentProjectId) {
      alert('please select the firmware');
      return;
    }
    this.model.uploadFirmware(this.currentProjectId);
  };

  onResetButton = () => {
    this.model.backToInitialPhase();
  };

  onLogButton = () => {
    showCommandOutputLogModal({
      caption: 'Operation Command Log',
      logText: this.model.firmwareUploadResult || ''
    });
  };
}
