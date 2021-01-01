import { generateRandomUid, removeArrayItemOne } from '~shared/funcs/Utils';

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

// IPCのラッパ, レンダラプロセス側
// メインプロセスで用意した関数を、レンダラプロセスから同一のシグニチャで呼べるようにする
export function createXpcRenderer(
  ipcRenderer: Electron.IpcRenderer,
  shuttleCompletionHook?: () => void
) {
  const allSubscriptionCodes: string[] = [];

  function createBackendAgent<T>(realm: string) {
    function createInvokerObject(name: string) {
      const sig = name.toString();
      // invoker object can be treated as well as both a promise function and an eventSource
      const invoker: IRpcInvokerObject = (...params: any[]) => {
        return new Promise((resolve) => {
          const xpcCode = `XPC__${realm}__${sig}`;
          ipcRenderer.once(`${xpcCode}__reply`, (event, response) => {
            resolve(response);
            shuttleCompletionHook?.();
            removeArrayItemOne(allSubscriptionCodes, xpcCode);
          });
          ipcRenderer.send(`${xpcCode}__call`, ...params);
          allSubscriptionCodes.push(xpcCode);
        });
      };
      const ipcEventHandlerMap = new Map<Function, ISubscriptionHandlerInfo>();
      invoker.subscribe = (listener: Function) => {
        const subscriptionUuid = generateRandomUid();
        const ipcEventHandler: IpcRendererEventHandler = (event, args) => {
          listener(args);
          shuttleCompletionHook?.();
        };
        const xpcCode = `XPC__${realm}__${sig}`;
        ipcRenderer.on(`${xpcCode}__event`, ipcEventHandler);
        ipcRenderer.send(`${xpcCode}__subscribe`, subscriptionUuid);
        ipcEventHandlerMap.set(listener, {
          ipcEventHandler,
          subscriptionUuid
        });
        allSubscriptionCodes.push(xpcCode);
      };
      invoker.unsubscribe = (listener: Function) => {
        const entry = ipcEventHandlerMap.get(listener);
        if (entry) {
          const { ipcEventHandler, subscriptionUuid } = entry;
          const xpcCode = `XPC__${realm}__${sig}`;
          ipcRenderer.off(`${xpcCode}__event`, ipcEventHandler);
          ipcRenderer.send(`${xpcCode}__unsubscribe`, subscriptionUuid);
          ipcEventHandlerMap.delete(listener);
          removeArrayItemOne(allSubscriptionCodes, xpcCode);
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

  function debugGetAllSubscriptionCodes() {
    return allSubscriptionCodes;
  }

  return {
    getBackendAgent,
    debugGetAllSubscriptionCodes
  };
}
