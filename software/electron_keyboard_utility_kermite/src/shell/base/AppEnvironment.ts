import * as path from 'path';
import { app } from 'electron';

export const appEnv = new (class {
  isDevelopment = process.env.NODE_ENV === 'development';

  resolveUserDataFilePath(relPath: string) {
    const appDataDir = app.getPath('userData');
    return path.join(appDataDir, relPath);
  }

  resolveAssetsPath(relPath: string) {
    const appDir = app.getAppPath();
    return path.join(appDir, relPath);
  }
})();
