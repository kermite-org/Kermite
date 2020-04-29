import { generateRandomUid } from '~funcs/IdGenerator';

interface IRpcInvokerObject {
  (...params: any[]): Promise<any>;
  subscribe(listener: Function): void;
  unsubscribe(listener: Function): void;
}

interface IpcRendererEventHandler {
  (event: Electron.IpcRendererEvent, ...args: any[]): void;
}

interface ISubscriptionHandlerInfo {
  subscriptionUuid: string;
  ipcEventHandler: IpcRendererEventHandler;
}

export function createXpcRenderer(ipcRenderer: Electron.IpcRenderer) {
  function createBackendAgent<T>(realm: string) {
    function createInvokerObject(name: string) {
      const sig = name.toString();
      //invoker object can be treated as well as both a promise function and an eventSource
      const invoker: IRpcInvokerObject = (...params: any[]) => {
        return new Promise((resolve) => {
          ipcRenderer.once(`XPC__${realm}__${sig}__reply`, (event, response) =>
            resolve(response)
          );
          ipcRenderer.send(`XPC__${realm}__${sig}__call`, ...params);
        });
      };
      const ipcEventHandlerMap = new Map<Function, ISubscriptionHandlerInfo>();
      invoker.subscribe = (listener: Function) => {
        const subscriptionUuid = generateRandomUid();
        const ipcEventHandler: IpcRendererEventHandler = (event, args) =>
          listener(args);
        ipcRenderer.on(`XPC__${realm}__${sig}__event`, ipcEventHandler);
        ipcRenderer.send(`XPC__${realm}__${sig}__subscribe`, subscriptionUuid);
        ipcEventHandlerMap.set(listener, {
          ipcEventHandler,
          subscriptionUuid
        });
      };
      invoker.unsubscribe = (listener: Function) => {
        const entry = ipcEventHandlerMap.get(listener);
        if (entry) {
          const { ipcEventHandler, subscriptionUuid } = entry;
          ipcRenderer.off(`XPC__${realm}__${sig}__event`, ipcEventHandler);
          ipcRenderer.send(
            `XPC__${realm}__${sig}__unsubscribe`,
            subscriptionUuid
          );
          ipcEventHandlerMap.delete(listener);
        }
      };
      return invoker;
    }

    const invokerObjectCached = new Map<string, any>();

    function getInvokerObjectCached(name: string) {
      if (invokerObjectCached.has(name)) {
        return invokerObjectCached.get(name);
      } else {
        const invoker = createInvokerObject(name);
        invokerObjectCached.set(name, invoker);
        return invoker;
      }
    }

    return new Proxy(
      {},
      {
        get: (target, name) => {
          return getInvokerObjectCached(name.toString());
        }
      }
    ) as T;
  }

  const backendAgentsCached = new Map<string, any>();

  function getBackendAgent<T>(realm: string): T {
    if (backendAgentsCached.has(realm)) {
      return backendAgentsCached.get(realm);
    } else {
      const agent = createBackendAgent<T>(realm);
      backendAgentsCached.set(realm, agent);
      return agent;
    }
  }

  return {
    getBackendAgent
  };
}
