import { backendAgent } from '~ui/core';

type FirmwareUpdationPhase =
  | 'WaitingReset'
  | 'WaitingUploadOrder'
  | 'Uploading'
  | 'UploadSuccess'
  | 'UploadFailure';

export class FirmwareUpdationModel {
  phase: FirmwareUpdationPhase = 'WaitingReset';
  comPortName: string | undefined = undefined;
  firmwareUploadResult: string | undefined = undefined;

  async uploadFirmware(projectId: string) {
    if (this.phase === 'WaitingUploadOrder' && this.comPortName) {
      this.phase = 'Uploading';
      const res = await backendAgent.uploadFirmware(
        projectId,
        this.comPortName
      );
      this.firmwareUploadResult = res;
      if (res === 'ok') {
        this.phase = 'UploadSuccess';
      } else {
        this.phase = 'UploadFailure';
      }
    }
  }

  private onComPortPlugEvent = ({
    comPortName
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

  backToInitialPhase() {
    this.phase = 'WaitingReset';
  }

  initialize() {
    backendAgent.comPortPlugEvents.subscribe(this.onComPortPlugEvent);
  }

  finalize() {
    backendAgent.comPortPlugEvents.unsubscribe(this.onComPortPlugEvent);
  }
}
