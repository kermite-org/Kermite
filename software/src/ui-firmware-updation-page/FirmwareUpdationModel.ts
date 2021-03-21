import { IProjectResourceInfo } from '~/shared';
import { ipcAgent } from '~/ui-common';

export type FirmwareUpdationPhase =
  | 'WaitingReset'
  | 'WaitingUploadOrder'
  | 'Uploading'
  | 'UploadSuccess'
  | 'UploadFailure';

export class FirmwareUpdationModel {
  currentProjectSig: string = '';
  phase: FirmwareUpdationPhase = 'WaitingReset';
  comPortName: string | undefined = undefined;
  firmwareUploadResult: string | undefined = undefined;

  private projectInfosWithFirmware: IProjectResourceInfo[] = [];

  setCurrentProjectSig = (projectSig: string) => {
    this.currentProjectSig = projectSig;
  };

  get projectOptions() {
    const blankOption = { value: '', label: 'select firmware' };
    const projectOptions = this.projectInfosWithFirmware.map((info) => ({
      value: info.sig,
      label: (info.origin === 'local' ? '[L]' : '[R]') + info.projectPath,
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
  private onDeviceDetectionEvent = ({
    comPortName,
  }: {
    comPortName?: string;
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
    if (!this.currentProjectSig) {
      alert('please select firmware');
      return;
    }
    if (this.phase === 'WaitingUploadOrder' && this.comPortName) {
      const info = this.projectInfosWithFirmware.find(
        (it) => it.sig === this.currentProjectSig,
      );
      if (info) {
        this.phase = 'Uploading';
        const res = await ipcAgent.async.firmup_uploadFirmware(
          info.origin,
          info.projectId,
        );
        this.firmwareUploadResult = res;
        if (res === 'ok') {
          this.phase = 'UploadSuccess';
        } else {
          this.phase = 'UploadFailure';
        }
      }
    }
  };

  private async fechProjectInfos() {
    const projectResourceInfos = await ipcAgent.async.projects_getAllProjectResourceInfos();
    this.projectInfosWithFirmware = projectResourceInfos.filter(
      (info) => info.hasFirmwareBinary,
    );
  }

  startPageSession = () => {
    this.fechProjectInfos();
    return ipcAgent.events.firmup_deviceDetectionEvents.subscribe(
      this.onDeviceDetectionEvent,
    );
  };
}

export const firmwareUpdationModel = new FirmwareUpdationModel();
