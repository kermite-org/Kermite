import { FirmwareFilesResource } from './FirmwareFilesResource';

export class FirmwareFilesManager {
  private _firmwareNames: string[] = [];

  get firmwareNames() {
    return this._firmwareNames;
  }

  async loadFirmwareFileNames() {
    await FirmwareFilesResource.ensureBinariesDirectoryExists();
    this._firmwareNames = await FirmwareFilesResource.listAllFirmwareNames();
    // console.log({ fnames: this.binaryFileNames });
  }
}
