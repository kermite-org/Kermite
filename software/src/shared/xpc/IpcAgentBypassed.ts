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
  let postProcessHook: (() => void) | undefined;

  let rawSyncReceivers: T['sync'] = {};
  let rawAsyncReceivers: T['async'] = {};

  let rawEventsReceivers: {
    [K in keyof T['events']]: (
      cb: (value: T['events'][K]) => void,
    ) => () => void;
  } = {} as any;

  const unSubscribers: Map<Function, Function> = new Map();

  function getSyncHandler(key: string) {
    return (...args: any[]) => rawSyncReceivers[key](...args);
  }

  function getAsyncHandler(key: string) {
    return async (...args: any[]) => {
      await rawAsyncReceivers[key](...args);
      postProcessHook?.();
    };
  }

  function subscribe<K extends keyof T['events']>(
    propKey: K,
    listener: (value: T['events'][K]) => void,
  ) {
    const listenerWrapper = (value: any) => {
      listener(value);
      postProcessHook?.();
    };
    const unSubscriber = rawEventsReceivers[propKey](listenerWrapper);
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
    setPropsProcessHook(hook: () => void) {
      postProcessHook = hook;
    },
    sync: new Proxy(
      {},
      {
        get: (target, key: string) => getSyncHandler(key),
      },
    ) as T['sync'],
    async: new Proxy(
      {},
      {
        get: (target, key: string) => getAsyncHandler(key),
      },
    ) as T['async'],
    // events: {} as T['events'],
    events: new Proxy(
      {},
      {
        get: (target, key: string) => ({
          subscribe: (listener: any) => subscribe(key, listener),
          unsubscribe: (listener: any) => unsubscribe(key, listener),
        }),
      },
    ) as T['events'],
    supplySyncHandlers(handlers) {
      rawSyncReceivers = handlers;
    },
    supplyAsyncHandlers(handlers) {
      rawAsyncReceivers = handlers;
    },
    supplySubscriptionHandlers(handlers) {
      rawEventsReceivers = handlers;
      // self.events = handlers as T['events'];
    },
    setErrorHandler() {},
  };
  return self;
}
