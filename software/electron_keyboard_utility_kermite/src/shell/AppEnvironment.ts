import * as path from 'path';
import { IEnvironmentConfig } from '~defs/ConfigTypes';
import { app } from 'electron';

export const environmentConfig: IEnvironmentConfig = {
  isDevelopment: process.env.NODE_ENV === 'development'
};

export function resolveFilePath(relPath: string) {
  const appDataDir = app.getPath('userData');
  return path.join(appDataDir, relPath);
}
