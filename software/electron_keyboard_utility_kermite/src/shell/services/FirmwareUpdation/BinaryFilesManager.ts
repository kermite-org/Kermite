import { BinaryFilesResource } from './BinaryFilesResource';

export class BinaryFilesManager {
  private _binaryFileNames: string[] = [];

  get binaryFileNames() {
    return this._binaryFileNames;
  }

  async loadBinaryFileNames() {
    await BinaryFilesResource.ensureBinariesDirectoryExists();
    this._binaryFileNames = await BinaryFilesResource.listAllBinaryFileNames();
    // console.log({ fnames: this.binaryFileNames });
  }
}
