import { IIpcContractBase } from './IpcContractBase';

type IErrorHandler = (error: any) => void;

export interface IIpcAgentBypassed<T extends IIpcContractBase> {
  // callee
  // setWebContents(webContents: Electron.WebContents): void;
  setErrorHandler(errorHandler: IErrorHandler): void;
  supplySyncHandlers(handlers: T['sync']): void;
  supplyAsyncHandlers(handlers: T['async']): void;
  supplySubscriptionHandlers(handlers: {
    [K in keyof T['events']]: (
      cb: (value: T['events'][K]) => void,
    ) => () => void;
  }): void;

  // caller
  setPropsProcessHook(hook: () => void): void;
  sync: T['sync'];
  async: T['async'];
  events: {
    [K in keyof T['events']]: {
      subscribe(listener: (value: T['events'][K]) => void): () => void;
      unsubscribe(listener: (value: T['events'][K]) => void): void;
    };
  };
}

export function createIpcAgentBypassed<
  T extends IIpcContractBase,
>(): IIpcAgentBypassed<T> {
  let syncReceiver: T['sync'] = {};
  let asyncReceiver: T['async'] = {};
  let eventsReceiver: T['events'] = {};

  return {
    sync: syncReceiver,
    async: asyncReceiver,
    events: eventsReceiver,
    supplySyncHandlers(handlers) {
      syncReceiver = handlers;
    },
    supplyAsyncHandlers(handlers) {
      asyncReceiver = handlers;
    },
    supplySubscriptionHandlers(handlers) {
      eventsReceiver = handlers;
    },
    setErrorHandler() {},
    setPropsProcessHook() {},
  };
}
