import * as path from 'path';
import { fsIsFileExists, fsCreateDirectory, globAsync } from '~funcs/Files';
import { appEnv } from '~shell/base/AppEnvironment';

export class FirmwareFilesResource {
  static get baseDir() {
    if (appEnv.isDevelopment) {
      return path.resolve('../firmware/src/build');
    } else {
      return appEnv.resolveUserDataFilePath('resources/variants');
    }
  }

  static async ensureBinariesDirectoryExists() {
    if (!fsIsFileExists(this.baseDir)) {
      await fsCreateDirectory(this.baseDir);
    }
  }

  static async listAllFirmwareNames(): Promise<string[]> {
    const filePaths = await globAsync(`${this.baseDir}/**/*.hex`);
    const relFileNames = filePaths.map((fpath) =>
      fpath.replace(this.baseDir + '/', '')
    );
    return relFileNames.map((fname) => fname.replace('.hex', ''));
  }

  static getHexFilePath(firmwareName: string): string {
    return appEnv.resolveAssetsPath(`${this.baseDir}/${firmwareName}.hex`);
  }
}
