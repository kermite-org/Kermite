import { ipcMain } from 'electron';
import { IIpcContractBase } from './IpcContractBase';

export interface IIpcMainAgent<T extends IIpcContractBase> {
  emitEvent<K extends keyof T['events']>(
    key: K,
    ...arg: T['events'][K] extends void ? [] : [T['events'][K]]
  ): void;
  setWebcontents(webContents: Electron.webContents): void;
  supplySyncHandlers(handlers: T['sync']): void;
  supplyAsyncHandlers(handlers: T['async']): void;
}

export class IpcMainAgent<T extends IIpcContractBase>
  implements IIpcMainAgent<T> {
  private webContents: Electron.webContents | undefined;

  emitEvent<K extends keyof T['events']>(
    key: Extract<K, string>,
    ...arg: T['events'][K] extends void ? [] : [T['events'][K]]
  ): void {
    this.webContents?.send(key, ...arg);
  }

  setWebcontents(webContents: Electron.WebContents): void {
    this.webContents = webContents;
  }

  supplySyncHandlers(handlers: T['sync']): void {
    for (const key in handlers) {
      const handler = handlers[key];
      ipcMain.on(key, (event, ...args) => {
        event.returnValue = handler(...args);
      });
    }
  }

  supplyAsyncHandlers(handlers: T['async']): void {
    for (const key in handlers) {
      const handler = handlers[key];
      ipcMain.handle(key, (event, ...args) => {
        return handler(...args);
      });
    }
  }
}
