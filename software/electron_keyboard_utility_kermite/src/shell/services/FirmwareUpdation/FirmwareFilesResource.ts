import { resolveAssetsPath } from '~shell/AppEnvironment';
import {
  fsIsFileExists,
  fsCreateDirectory,
  fsListFilesInDirectory
} from '~funcs/Files';

const relBinariesFolderPath = 'dist/binaries';

export class FirmwareFilesResource {
  static async ensureBinariesDirectoryExists() {
    const binariesDirPath = resolveAssetsPath(relBinariesFolderPath);
    if (!fsIsFileExists(binariesDirPath)) {
      await fsCreateDirectory(binariesDirPath);
    }
  }

  static async listAllFirmwareNames(): Promise<string[]> {
    const fileNames = await fsListFilesInDirectory(
      resolveAssetsPath(relBinariesFolderPath)
    );
    return fileNames.map((fname) => fname.replace('.hex', ''));
  }

  static getHexFilePath(firmwareName: string): string {
    return resolveAssetsPath(`${relBinariesFolderPath}/${firmwareName}.hex`);
  }
}
