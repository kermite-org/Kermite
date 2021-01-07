import { backendAgent } from '~ui/core';
import { ProjectResourceModel } from '~ui/models/ProjectResourceModel';

export type FirmwareUpdationPhase =
  | 'WaitingReset'
  | 'WaitingUploadOrder'
  | 'Uploading'
  | 'UploadSuccess'
  | 'UploadFailure';

export class FirmwareUpdationModel {
  currentProjectId: string = '';
  phase: FirmwareUpdationPhase = 'WaitingReset';
  comPortName: string | undefined = undefined;
  firmwareUploadResult: string | undefined = undefined;

  constructor(private projectResourceModel: ProjectResourceModel) {}

  setCurrentProjectId = (projectId: string) => {
    this.currentProjectId = projectId;
  };

  get projectOptions() {
    const blankOption = { id: '', text: 'select firmware' };
    const projectOptions = this.projectResourceModel
      .getProjectsWithFirmware()
      .map((info) => ({
        id: info.projectId,
        text: info.projectPath,
      }));
    return [blankOption, ...projectOptions];
  }

  get canSelectTargetFirmware() {
    const { phase } = this;
    return phase === 'WaitingReset' || phase === 'WaitingUploadOrder';
  }

  // 0: WaitingReset
  backToInitialPhase = () => {
    this.phase = 'WaitingReset';
  };

  // 1: WaitingReset --> WaitingUploadOrder
  private onComPortPlugEvent = ({
    comPortName,
  }: {
    comPortName: string | undefined;
  }) => {
    this.comPortName = comPortName;
    if (this.phase === 'WaitingReset' && this.comPortName) {
      this.phase = 'WaitingUploadOrder';
    }
    if (this.phase === 'WaitingUploadOrder' && !this.comPortName) {
      this.phase = 'WaitingReset';
    }
  };

  // 2: WaitingUploadOrder --> Uploading --> UploadSuccess,UploadFailure
  uploadFirmware = async () => {
    if (!this.currentProjectId) {
      alert('please select the firmware');
      return;
    }
    if (this.phase === 'WaitingUploadOrder' && this.comPortName) {
      this.phase = 'Uploading';
      const res = await backendAgent.uploadFirmware(
        this.currentProjectId,
        this.comPortName,
      );
      this.firmwareUploadResult = res;
      if (res === 'ok') {
        this.phase = 'UploadSuccess';
      } else {
        this.phase = 'UploadFailure';
      }
    }
  };

  initialize() {
    backendAgent.comPortPlugEvents.subscribe(this.onComPortPlugEvent);
  }

  finalize() {
    backendAgent.comPortPlugEvents.unsubscribe(this.onComPortPlugEvent);
  }
}
