import { appEnv } from '~shell/base/AppEnvironment';
import { fsIsFileExists, fsCreateDirectory, globAsync } from '~funcs/Files';
const relBinariesFolderPath = 'dist/binaries/binary';

export class FirmwareFilesResource {
  static async ensureBinariesDirectoryExists() {
    const binariesDirPath = appEnv.resolveAssetsPath(relBinariesFolderPath);
    if (!fsIsFileExists(binariesDirPath)) {
      await fsCreateDirectory(binariesDirPath);
    }
  }

  static async listAllFirmwareNames(): Promise<string[]> {
    const filePaths = await globAsync(`${relBinariesFolderPath}/**/*.hex`);
    const relFileNames = filePaths.map((fpath) =>
      fpath.replace(relBinariesFolderPath + '/', '')
    );
    return relFileNames.map((fname) => fname.replace('.hex', ''));
  }

  static getHexFilePath(firmwareName: string): string {
    return appEnv.resolveAssetsPath(
      `${relBinariesFolderPath}/${firmwareName}.hex`
    );
  }
}
