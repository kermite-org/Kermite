import { Models } from '~ui/models';
import { FirmwareUpdationModel } from '~ui/models/FirmwareUpdationModel';
import { showCommandOutputLogModal } from '~ui/views/modals/CommandOutputLogModal';

export class FirmwareUpdationPageViewModel {
  selectedFirmwareName: string = '';

  model: FirmwareUpdationModel;

  constructor(models: Models) {
    this.model = models.firmwareUpdationModel;
  }

  get phase() {
    return this.model.phase;
  }

  get firmwareNames() {
    return this.model.firmwareNames;
  }

  get comPortName() {
    return this.model.comPortName;
  }

  get canSelectTargetFirmware() {
    const { phase } = this.model;
    return phase === 'WaitingReset' || phase === 'WaitingUploadOrder';
  }

  setSelectedFirmwareName = (firmwareName: string) => {
    this.selectedFirmwareName = firmwareName;
  };

  onWriteButton = () => {
    if (!this.selectedFirmwareName) {
      alert('please select the firmware');
      return;
    }
    this.model.uploadFirmware(this.selectedFirmwareName);
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

  initialize() {
    this.model.startComPortListener();
  }

  finalize() {
    this.model.endComPortListener();
  }
}
