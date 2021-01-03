import { IIpcContractBase } from './IpcContractBase';

interface IIpcRendererAgent<T extends IIpcContractBase> {
  sync: T['sync'];
  async: T['async'];
  invoke<K extends keyof T['async']>(
    key: K,
    ...args: Parameters<T['async'][K]>
  ): ReturnType<T['async'][K]>;
  sendSync<K extends keyof T['sync']>(
    key: K,
    ...args: Parameters<T['sync'][K]>
  ): ReturnType<T['sync'][K]>;
  subscribe<K extends keyof T['events']>(
    key: K,
    handler: (value: T['events'][K]) => void,
  ): () => void;
}

export function getIpcRendererAgent<
  T extends IIpcContractBase
>(): IIpcRendererAgent<T> {
  const ipcRenderer = (window.top as any).ipcRenderer;
  return {
    sync: new Proxy(
      {},
      {
        get: (target, key) => (...args: any[]) =>
          ipcRenderer.sendSync(key, ...args),
      },
    ) as T['sync'],
    async: new Proxy(
      {},
      {
        get: (target, key) => (...args: any[]) =>
          ipcRenderer.invoke(key, ...args),
      },
    ) as T['async'],
    invoke: ipcRenderer.invoke,
    sendSync: ipcRenderer.sendSync,
    subscribe: ((key: string, listener: any) => {
      const wrapper = (event: any, value: any) => listener(value);
      ipcRenderer.on(key, wrapper);
      return () => ipcRenderer.removeListener(key, wrapper);
    }) as any,
  };
}
