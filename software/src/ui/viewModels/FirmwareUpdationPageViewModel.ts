import { Models } from '~ui/models';
import { FirmwareUpdationModel } from '~ui/models/FirmwareUpdationModel';
import { callErrorLogModal } from '~ui/views/pages/FirmwareUpdationPage/ErrorLogModal';

export class FirmwareUpdationPageViewModel {
  selectedFirmwareName: string = '';

  model: FirmwareUpdationModel;

  constructor(models: Models) {
    this.model = models.firmwareUpdationModel;
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
    callErrorLogModal(this.model.firmwareUploadResult || '');
  };

  initialize() {
    this.model.startComPortListener();
  }

  finalize() {
    this.model.endComPortListener();
  }
}
