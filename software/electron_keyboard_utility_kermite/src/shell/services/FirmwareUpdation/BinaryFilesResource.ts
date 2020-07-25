import { resolveAssetsPath } from '~shell/AppEnvironment';
import {
  fsIsFileExists,
  fsCreateDirectory,
  fsListFilesInDirectory
} from '~funcs/Files';

export class BinaryFilesResource {
  static async ensureBinariesDirectoryExists() {
    const binariesDirPath = resolveAssetsPath('dist/binaries');
    if (!fsIsFileExists(binariesDirPath)) {
      await fsCreateDirectory(binariesDirPath);
    }
  }

  static async listAllBinaryFileNames(): Promise<string[]> {
    const fileNames = await fsListFilesInDirectory(
      resolveAssetsPath('dist/binaries')
    );
    return fileNames.map((fname) => fname.replace('.hex', ''));
  }
}
