import * as path from 'path';
import { IEnvironmentConfig } from '~defs/ConfigTypes';
import { app } from 'electron';
import { IAppWindowEvent } from '~defs/IpcContract';
import { TypedEventEmitter } from '~funcs/TypedEventEmitter';

export const environmentConfig: IEnvironmentConfig = {
  isDevelopment: process.env.NODE_ENV === 'development'
};

export function resolveUserDataFilePath(relPath: string) {
  const appDataDir = app.getPath('userData');
  return path.join(appDataDir, relPath);
}

export function resolveAssetsPath(relPath: string) {
  const appDir = app.getAppPath();
  return path.join(appDir, relPath);
}

interface TypedApplicationEvent {
  mainWindowClosed: true;
  reloadApplicationRequested: true;
  appWindowEvent: IAppWindowEvent;
}

export const eventBus = new TypedEventEmitter<TypedApplicationEvent>();
