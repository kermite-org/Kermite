import { IResourceOrigin } from '~/shared';
import { createEventPort } from '~/shell/funcs';
import { projectResourceProvider } from '~/shell/projectResources';
import {
  ComPortsMonitor,
  IComPortDetectionEvent,
} from '~/shell/services/firmwareUpdation/flashSchemeAtMega/ComPortsMonitor';
import { FlashCommander } from '~/shell/services/firmwareUpdation/flashSchemeAtMega/FlashCommander';

// 仮想COMポートでProMicroのブートローダ(Caterina)と通信しファームウェアを書き込む
// 仮想COMポートの列挙や出現監視も行う
export class FirmwareUpdationService {
  private comPortsMonitor = new ComPortsMonitor();

  deviceDetectionEvents = createEventPort<IComPortDetectionEvent>({
    onFirstSubscriptionStarting: () => this.startDetection(),
    onLastSubscriptionEnded: () => this.stopDetection(),
  });

  private onComPortDetectionEvent = (event: IComPortDetectionEvent) => {
    this.deviceDetectionEvents.emit(event);
  };

  private startDetection() {
    this.comPortsMonitor.startDetection(this.onComPortDetectionEvent);
  }

  private stopDetection() {
    this.comPortsMonitor.stopDetection();
  }

  async writeFirmware(
    origin: IResourceOrigin,
    projectId: string,
    comPortName: string,
  ): Promise<'ok' | string> {
    const hexFilePath = await projectResourceProvider.loadProjectFirmwareFile(
      origin,
      projectId,
    );

    if (!hexFilePath) {
      return `cannot find firmware`;
    }

    const flashResult = await FlashCommander.uploadFirmware(
      hexFilePath,
      comPortName,
    );
    if (flashResult !== 'ok') {
      console.log(`firmwre upload error`);
    }
    console.log(flashResult);
    return flashResult;
  }
}
