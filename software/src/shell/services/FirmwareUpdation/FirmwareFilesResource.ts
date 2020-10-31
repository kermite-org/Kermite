import * as path from 'path';
import { fsIsFileExists, fsCreateDirectory, globAsync } from '~funcs/Files';
import { appEnv } from '~shell/base/AppEnvironment';

export class FirmwareFilesResource {
  static get baseDir() {
    if (appEnv.isDevelopment) {
      return path.resolve('../firmware/build');
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
    const projectPaths = filePaths.map((filePath) =>
      path.dirname(filePath).replace(`${this.baseDir}/`, '')
    );
    return projectPaths;
  }

  static getHexFilePath(projectPath: string): string {
    const coreName = path.basename(projectPath);
    return `${this.baseDir}/${projectPath}/${coreName}.hex`;
  }
}
