import { appUi } from '../core/appUi';
import { backendAgent } from '../core/ipc';

type FirmwareUpdationPhase =
  | 'WaitingReset'
  | 'WaitingUploadOrder'
  | 'Uploading'
  | 'UploadSuccess'
  | 'UploadFailure';

class FirmwareUpdationModel {
  firmwareNames: string[] = [];
  phase: FirmwareUpdationPhase = 'WaitingReset';
  comPortName: string | undefined = undefined;
  firmwareUploadResult: string | undefined = undefined;

  async uploadFirmware(firmwareName: string) {
    if (this.phase === 'WaitingUploadOrder' && this.comPortName) {
      this.phase = 'Uploading';
      appUi.rerender();
      const res = await backendAgent.uploadFirmware(
        firmwareName,
        this.comPortName
      );
      this.firmwareUploadResult = res;
      if (res === 'ok') {
        this.phase = 'UploadSuccess';
      } else {
        this.phase = 'UploadFailure';
      }
      appUi.rerender();
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
    appUi.rerender();
  };

  backToInitialPhase() {
    this.phase = 'WaitingReset';
  }

  startComPortListener() {
    backendAgent.comPortPlugEvents.subscribe(this.onComPortPlugEvent);
  }

  endComPortListener() {
    backendAgent.comPortPlugEvents.unsubscribe(this.onComPortPlugEvent);
  }

  async initialize() {
    this.firmwareNames = await backendAgent.getFirmwareNamesAvailable();
    appUi.rerender();
  }

  finalize() {}
}

export const firmwareUpdationModel = new FirmwareUpdationModel();
