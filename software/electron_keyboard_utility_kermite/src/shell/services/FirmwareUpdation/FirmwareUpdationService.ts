import { BinaryFileManager } from './BinaryFileManager';

export class FirmwareUpdationService {
  private binaryFileNames: string[] = [];

  getFirmwareNamesAvailable(): string[] {
    return this.binaryFileNames;
  }

  private async listBinaryFileNames() {
    await BinaryFileManager.ensureBinariesDirectoryExists();
    this.binaryFileNames = await BinaryFileManager.listAllBinaryFileNames();
    console.log({ fnames: this.binaryFileNames });
  }

  async initialize(): Promise<void> {
    this.listBinaryFileNames();
  }

  async terminate(): Promise<void> {}
}
