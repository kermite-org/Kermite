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
  let rawEventsReceivers: {
    [K in keyof T['events']]: (
      cb: (value: T['events'][K]) => void,
    ) => () => void;
  } = {} as any;

  const unSubscribers: Map<Function, Function> = new Map();

  function subscribe<K extends keyof T['events']>(
    propKey: K,
    listener: (value: T['events'][K]) => void,
  ) {
    const unSubscriber = rawEventsReceivers[propKey](listener);
    unSubscribers.set(listener, unSubscriber);
    return unSubscriber;
  }

  function unsubscribe<K extends keyof T['events']>(
    propKey: K,
    listener: (value: T['events'][K]) => void,
  ) {
    const unSubscriber = unSubscribers.get(listener);
    unSubscriber?.();
    unSubscribers.delete(listener);
  }

  const self: IIpcAgentBypassed<T> = {
    sync: {},
    async: {},
    // events: {} as T['events'],
    events: new Proxy(
      {},
      {
        get: (target, key: string) => ({
          subscribe: (listener: any) => subscribe(key, listener),
          unsubscribe: (listener: any) => unsubscribe(key, listener),
        }),
      },
    ) as any,
    supplySyncHandlers(handlers) {
      self.sync = handlers;
    },
    supplyAsyncHandlers(handlers) {
      self.async = handlers;
    },
    supplySubscriptionHandlers(handlers) {
      rawEventsReceivers = handlers;
      // self.events = handlers as T['events'];
    },
    setErrorHandler() {},
    setPropsProcessHook() {},
  };
  return self;
}
