// import { IpcRenderer } from 'electron';
import { removeArrayItems } from '~/shared/funcs';
import { IIpcContractBase } from './IpcContractBase';

type IpcRenderer = any;
export interface IIpcRendererAgent<T extends IIpcContractBase> {
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

function createDummeyIpcRendererAgentForMockDevelopment(): IIpcRendererAgent<any> {
  return {
    setPropsProcessHook: () => {},
    sync: new Proxy({}, { get: () => () => {} }) as any,
    async: new Proxy({}, { get: () => () => {} }) as any,
    events: new Proxy(
      {},
      {
        get: () => ({
          subscribe: () => {
            return () => {};
          },
          unsubscribe: () => {},
        }),
      },
    ) as any,
  };
}

interface ISubscriptionEntry {
  listener: (value: any) => void;
  wrapper: (...args: any) => void;
  propKey: string;
  subscriptionKey: string;
}

export function getIpcRendererAgent<
  T extends IIpcContractBase,
>(): IIpcRendererAgent<T> {
  const ipcRenderer = (window as any).ipcRenderer as IpcRenderer;

  if (!ipcRenderer) {
    return createDummeyIpcRendererAgentForMockDevelopment();
  }

  let postProcessHook: (() => void) | undefined;

  const subscriptionEntries: ISubscriptionEntry[] = [];

  function getSyncHandler(key: string) {
    return (...args: any[]) => ipcRenderer.sendSync(key, ...args);
  }

  function getAsyncHandler(key: string) {
    return (...args: any[]) => {
      return new Promise((resolve) => {
        ipcRenderer.invoke(key, ...args).then((res: any) => {
          resolve(res);
          postProcessHook?.();
        });
      });
    };
  }

  function subscribe<K extends keyof T['events']>(
    propKey: Extract<K, string>,
    listener: (value: T['events'][K]) => void,
  ) {
    const subscriptionKey = `${propKey}_${(Math.random() * 100000) >> 0}`; // todo GUIDのようなものを使う
    const wrapper = (event: any, value: any) => {
      listener(value);
      postProcessHook?.();
    };
    ipcRenderer.on(subscriptionKey, wrapper);
    ipcRenderer.invoke(`__subscriptionStarted__${propKey}`, subscriptionKey);
    subscriptionEntries.push({
      listener,
      wrapper,
      propKey: propKey as string,
      subscriptionKey,
    });
    return () => unsubscribe(propKey, listener);
  }

  function unsubscribe<K extends keyof T['events']>(
    propKey: Extract<K, string>,
    listener: (value: T['events'][K]) => void,
  ) {
    const entry = subscriptionEntries.find(
      (se) => se.propKey === propKey && se.listener === listener,
    );
    if (entry) {
      const { wrapper, subscriptionKey } = entry;
      ipcRenderer.removeListener(subscriptionKey, wrapper);
      ipcRenderer.invoke(`__subscriptionEnded__${propKey}`, subscriptionKey);
      removeArrayItems(subscriptionEntries, entry);
    }
  }

  return {
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
    events: new Proxy(
      {},
      {
        get: (target, key: string) => ({
          subscribe: (listener: any) => subscribe(key, listener),
          unsubscribe: (listener: any) => unsubscribe(key, listener),
        }),
      },
    ) as any,
  };
}
