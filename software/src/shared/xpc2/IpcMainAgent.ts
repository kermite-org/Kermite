import { ipcMain } from 'electron';
import { IIpcContractBase } from './IpcContractBase';

export interface IIpcMainAgent<T extends IIpcContractBase> {
  setWebcontents(webContents: Electron.webContents): void;
  supplySyncHandlers(handlers: T['sync']): void;
  supplyAsyncHandlers(handlers: T['async']): void;
  supplySubscriptionHandlers(
    handlers: {
      [K in keyof T['events']]: (
        cb: (value: T['events'][K]) => void,
      ) => () => void;
    },
  ): void;
}

export class IpcMainAgent<T extends IIpcContractBase>
  implements IIpcMainAgent<T> {
  private webContents: Electron.webContents | undefined;

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

  private unsubMap: { [key: string]: any } = {};

  supplySubscriptionHandlers(
    handlers: {
      [K in keyof T['events']]: (
        cb: (value: T['events'][K]) => void,
      ) => () => void;
    },
  ) {
    for (const propKey in handlers) {
      const handler = handlers[propKey]!;
      ipcMain.handle(
        `__subscriptionStarted__${propKey}`,
        (event, subsciptionKey) => {
          // console.log(`subscriptionStarted ${subsciptionKey}`);
          const callback = (value: any) => {
            this.webContents?.send(subsciptionKey, value);
          };
          const unsub = handler(callback);
          this.unsubMap[subsciptionKey] = unsub;
        },
      );
      ipcMain.handle(
        `__subscriptionEnded__${propKey}`,
        (event, subsciptionKey) => {
          // console.log(`subscriptionEnded ${subsciptionKey}`);
          const unsub = this.unsubMap[subsciptionKey];
          unsub?.();
          delete this.unsubMap[subsciptionKey];
        },
      );
    }
  }
}
