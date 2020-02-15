import * as path from 'path';

export const appConfig = {
  isDevelopment: process.env.NODE_ENV === 'development'
};

export function resolveFilePath(relPath: string) {
  return path.resolve(relPath);
}
