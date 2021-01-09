import { IpcRenderer } from 'electron';
import { IIpcContractBase } from './IpcContractBase';

export interface IIpcRendererAgent<T extends IIpcContractBase> {
  sync: T['sync'];
  async: T['async'];
  subscribe<K extends keyof T['events']>(
    key: K,
    handler: (value: T['events'][K]) => void,
  ): () => void;
  setPropsProcessHook(hook: () => void): void;
}

export function getIpcRendererAgent<
  T extends IIpcContractBase
>(): IIpcRendererAgent<T> {
  const ipcRenderer = (window.top as any).ipcRenderer as IpcRenderer;
  let postProcessHook: (() => void) | undefined;
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
            console.log('postProcessHook on async ipc end process');
            postProcessHook?.();
          });
        },
      },
    ) as T['async'],
    subscribe: ((propKey: string, listener: any) => {
      const subsciptionKey = `${propKey}_${(Math.random() * 100000) >> 0}`; // todo GUIDのようなものを使う
      const wrapper = (event: any, value: any) => {
        listener(value);
        postProcessHook?.();
      };
      // console.log(`[ren] S.S ${subsciptionKey}`);
      ipcRenderer.on(subsciptionKey, wrapper);
      ipcRenderer.invoke(`__subscriptionStarted__${propKey}`, subsciptionKey);
      return () => {
        // console.log(`[ren] S.E ${subsciptionKey}`);
        ipcRenderer.removeListener(subsciptionKey, wrapper);
        ipcRenderer.invoke(`__subscriptionEnded__${propKey}`, subsciptionKey);
      };
    }) as any,
    setPropsProcessHook(hook: () => void) {
      postProcessHook = hook;
    },
  };
}
