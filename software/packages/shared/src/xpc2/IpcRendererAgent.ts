import { IpcRenderer } from 'electron';
import { IIpcContractBase } from './IpcContractBase';

export interface IIpcRendererAgent<T extends IIpcContractBase> {
  sync: T['sync'];
  async: T['async'];
  subscribe<K extends keyof T['events']>(
    propKey: K,
    listener: (value: T['events'][K]) => void,
  ): () => void;
  setPropsProcessHook(hook: () => void): void;

  // events: {
  //   [K in keyof T['events']]: {
  //     subscribe(listener: (value: T['events'][K]) => void): () => void;
  //     subscribe2(listener: (value: T['events'][K]) => void): void;
  //     unsubscribe2(listener: (value: T['events'][K]) => void): void;
  //   };
  // };
  subscribe2<K extends keyof T['events']>(
    propKey: K,
    listener: (value: T['events'][K]) => void,
  ): void;
  unsubscribe2<K extends keyof T['events']>(
    propKey: K,
    listener: (value: T['events'][K]) => void,
  ): void;
}

interface ISubscriptionEntry {
  listener: (value: any) => void;
  wrapper: (...args: any) => void;
  propKey: string;
  subscriptionKey: string;
}

export function getIpcRendererAgent<
  T extends IIpcContractBase
>(): IIpcRendererAgent<T> {
  const ipcRenderer = (window.top as any).ipcRenderer as IpcRenderer;
  let postProcessHook: (() => void) | undefined;

  const subscriptionEntries: ISubscriptionEntry[] = [];

  return {
    sync: new Proxy(
      {},
      {
        get: (target, key: string) => (...args: any[]) =>
          ipcRenderer.sendSync(key, ...args),
      },
    ) as T['sync'],
    async: new Proxy(
      {},
      {
        get: (target, key: string) => (...args: any[]) => {
          return new Promise((resolve) => {
            const res = ipcRenderer.invoke(key, ...args);
            resolve(res);
            postProcessHook?.();
          });
        },
      },
    ) as T['async'],
    subscribe: ((propKey: string, listener: any) => {
      const subscriptionKey = `${propKey}_${(Math.random() * 100000) >> 0}`; // todo GUIDのようなものを使う
      const wrapper = (event: any, value: any) => {
        listener(value);
        postProcessHook?.();
      };
      // console.log(`[ren] S.S ${subsciptionKey}`);
      ipcRenderer.on(subscriptionKey, wrapper);
      ipcRenderer.invoke(`__subscriptionStarted__${propKey}`, subscriptionKey);
      return () => {
        // console.log(`[ren] S.E ${subsciptionKey}`);
        ipcRenderer.removeListener(subscriptionKey, wrapper);
        ipcRenderer.invoke(`__subscriptionEnded__${propKey}`, subscriptionKey);
      };
    }) as any,
    setPropsProcessHook(hook: () => void) {
      postProcessHook = hook;
    },
    subscribe2<K extends keyof T['events']>(
      propKey: K,
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
    },
    unsubscribe2<K extends keyof T['events']>(
      propKey: K,
      listener: (value: T['events'][K]) => void,
    ) {
      const entry = subscriptionEntries.find(
        (se) => se.propKey === propKey && se.listener === listener,
      );
      if (entry) {
        const { wrapper, subscriptionKey } = entry;
        ipcRenderer.removeListener(subscriptionKey, wrapper);
        ipcRenderer.invoke(`__subscriptionEnded__${propKey}`, subscriptionKey);
      }
    },
  };
}
