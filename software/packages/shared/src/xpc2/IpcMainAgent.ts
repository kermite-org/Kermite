import { ipcMain } from 'electron';
import { IIpcContractBase } from './IpcContractBase';

type IEmitEventArgs<
  T extends IIpcContractBase,
  K extends keyof T['events']
> = T['events'][K] extends void ? [] : [T['events'][K]];
export interface IIpcMainAgent<T extends IIpcContractBase> {
  emitEvent<K extends keyof T['events']>(
    key: K,
    ...arg: IEmitEventArgs<T, K>
  ): void;
  setWebcontents(webContents: Electron.webContents): void;
  supplySyncHandlers(handlers: T['sync']): void;
  supplyAsyncHandlers(handlers: T['async']): void;
  setSubscriptionStartCallback(key: keyof T['events'], cb: () => void): void;
}

export class IpcMainAgent<T extends IIpcContractBase>
  implements IIpcMainAgent<T> {
  private webContents: Electron.webContents | undefined;

  private subscriptionStartCallbacks: {
    [key in keyof T['events']]?: () => void;
  } = {};

  constructor() {
    ipcMain.handle('__subscriptionStarted', (event, key) => {
      this.subscriptionStartCallbacks?.[key]?.();
    });
  }

  setSubscriptionStartCallback(key: keyof T['events'], cb: () => void) {
    this.subscriptionStartCallbacks[key] = cb;
  }

  emitEvent<K extends keyof T['events']>(
    key: Extract<K, string>,
    ...arg: IEmitEventArgs<T, K>
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
