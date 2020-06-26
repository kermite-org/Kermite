import * as path from 'path';
import { IEnvironmentConfig } from '~defs/ConfigTypes';
import { app } from 'electron';

export const environmentConfig: IEnvironmentConfig = {
  isDevelopment: process.env.NODE_ENV === 'development'
};

function getDataDirectoryPath() {
  const appDataDir = app.getPath('userData');
  const dir = path.basename(appDataDir);
  if (dir === 'Electron') {
    //デバッグ時にboot.jsからchildProcess.spawnでelectronを起動した際に、app.nameが
    //package.jsonから拾われず'Electron'となるため、この場合のデータディレクトリのパスを自前で変更
    return path.join(appDataDir, '../', 'Kermite');
  } else {
    return appDataDir;
  }
}
const appDataDir = getDataDirectoryPath();

export function resolveFilePath(relPath: string) {
  return path.join(appDataDir, relPath);
}
