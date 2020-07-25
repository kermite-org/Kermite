import { BinaryFileResource } from './BinaryFileResource';
import { SerialPortResource } from './SerialPortResource';

export class FirmwareUpdationService {
  private binaryFileNames: string[] = [];

  getFirmwareNamesAvailable(): string[] {
    return this.binaryFileNames;
  }

  private async listBinaryFileNames() {
    await BinaryFileResource.ensureBinariesDirectoryExists();
    this.binaryFileNames = await BinaryFileResource.listAllBinaryFileNames();
    console.log({ fnames: this.binaryFileNames });
  }

  async initialize(): Promise<void> {
    this.listBinaryFileNames();

    const comPorts = await SerialPortResource.getComPortNames();
    console.log({ comPorts });
  }

  async terminate(): Promise<void> {}
}
