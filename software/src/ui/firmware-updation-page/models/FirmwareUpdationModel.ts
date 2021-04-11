import { flattenArray, IProjectResourceInfo } from '~/shared';
import { ipcAgent } from '~/ui/common';

export type FirmwareUpdationPhase =
  | 'WaitingReset'
  | 'WaitingUploadOrder'
  | 'Uploading'
  | 'UploadSuccess'
  | 'UploadFailure';

export class FirmwareUpdationModel {
  currentProjectFirmwareSpec: string = '';
  phase: FirmwareUpdationPhase = 'WaitingReset';
  detectedDeviceSig: string | undefined = undefined;
  firmwareUploadResult: string | undefined = undefined;

  private projectInfosWithFirmware: IProjectResourceInfo[] = [];

  setCurrentProjectFirmwareSpec = (spec: string) => {
    this.currentProjectFirmwareSpec = spec;
  };

  get projectOptions() {
    const blankOption = { value: '', label: 'select firmware' };
    const projectOptions = flattenArray(
      this.projectInfosWithFirmware.map((info) =>
        info.firmwares.map((firmware) => ({
          value: `${info.sig}:${firmware.variationName}`,
          label: `${info.origin === 'local' ? '[L]' : '[R]'} ${
            info.projectPath
          } ${firmware.variationName}`,
        })),
      ),
    );
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
    driveName,
  }: {
    comPortName?: string;
    driveName?: string;
  }) => {
    this.detectedDeviceSig = comPortName || driveName;
    if (this.phase === 'WaitingReset' && this.detectedDeviceSig) {
      this.phase = 'WaitingUploadOrder';
    }
    if (this.phase === 'WaitingUploadOrder' && !this.detectedDeviceSig) {
      this.phase = 'WaitingReset';
    }
  };

  // 2: WaitingUploadOrder --> Uploading --> UploadSuccess,UploadFailure
  uploadFirmware = async () => {
    if (!this.currentProjectFirmwareSpec) {
      alert('please select firmware');
      return;
    }
    if (this.phase === 'WaitingUploadOrder' && this.detectedDeviceSig) {
      const [projectSig, variationName] = this.currentProjectFirmwareSpec.split(
        ':',
      );
      const info = this.projectInfosWithFirmware.find((it) =>
        it.sig.startsWith(projectSig),
      );
      if (info) {
        this.phase = 'Uploading';
        const res = await ipcAgent.async.firmup_uploadFirmware(
          info.origin,
          info.projectId,
          variationName,
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
      (info) => info.firmwares.length > 0,
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
