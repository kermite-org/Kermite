import { IProjectResourceInfoProvider } from '../serviceInterfaces';
import { ComPortsMonitor } from './ComPortsMonitor';
import { FlashCommander } from './FlashCommander';

// 仮想COMポートでProMicroのブートローダ(Caterina)と通信しファームウェアを書き込む
// 仮想COMポートの列挙や出現監視も行う
export class FirmwareUpdationService {
  private comPortsMonitor = new ComPortsMonitor();

  constructor(
    private projectResourceInfoProvider: IProjectResourceInfoProvider
  ) {}

  getFirmwareNamesAvailable(): string[] {
    return this.projectResourceInfoProvider
      .getAllProjectResourceInfos()
      .filter((info) => info.hasFirmwareBinary)
      .map((info) => info.projectPath);
  }

  readonly comPortPlugEvents = this.comPortsMonitor.comPortPlugEvents;

  private getHexFilePathByProjectPath(projectPath: string): string | undefined {
    const info = this.projectResourceInfoProvider
      .getAllProjectResourceInfos()
      .find((info) => info.projectPath === projectPath);
    if (info) {
      return this.projectResourceInfoProvider.getHexFilePath(info.projectId);
    }
    return undefined;
  }

  async writeFirmware(
    projectPath: string,
    comPortName: string
  ): Promise<'ok' | string> {
    const hexFilePath = this.getHexFilePathByProjectPath(projectPath);

    if (!hexFilePath) {
      return `cannot find firmware for ${projectPath}`;
    }

    const flashResult = await FlashCommander.uploadFirmware(
      hexFilePath,
      comPortName
    );
    if (flashResult !== 'ok') {
      console.log(`firmwre upload error`);
    }
    console.log(flashResult);
    return flashResult;
  }

  initialize() {
    this.comPortsMonitor.initializeTicker();
  }

  terminate() {
    this.comPortsMonitor.terminateTicker();
  }
}
