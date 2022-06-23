// import { app } from 'electron';
import { pathJoin } from '~/shell/funcs';
import { processEnv } from './AppConfig';

export const appEnv = new (class {
  isDevelopment = processEnv.NODE_ENV === 'development';
  // isDevelopment = location.host === 'localhost';

  // platform = process.platform;

  get userDataFolderPath() {
    // return app.getPath('userData');
    return '';
  }

  resolveUserDataFilePath(relPath: string) {
    // const appDataDir = app.getPath('userData');
    // return pathJoin(appDataDir, relPath);
    return relPath;
  }

  resolveTempFilePath(relPath: string) {
    // const tmpDir = app.getPath('temp');
    // return pathJoin(tmpDir, relPath);
    return pathJoin('temp', relPath);
  }

  resolveApplicationRootDir() {
    // return pathResolve();
    return '';
  }
})();
