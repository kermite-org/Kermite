import { BinaryFileResource } from './BinaryFileResource';

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
  }

  async terminate(): Promise<void> {}
}
