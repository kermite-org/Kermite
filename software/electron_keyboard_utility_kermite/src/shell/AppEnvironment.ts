import * as path from 'path';
import { IEnvironmentConfig } from '~defs/ConfigTypes';

export const environmentConfig: IEnvironmentConfig = {
  isDevelopment: process.env.NODE_ENV === 'development'
};

export function resolveFilePath(relPath: string) {
  return path.resolve(relPath);
}
