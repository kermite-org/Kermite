import { ipcMain } from 'electron';
import { IEventSource } from './types';

// IPCのラッパ, メインプロセス側
// メインプロセスで用意した関数を、レンダラプロセスから同一のシグニチャで呼べるようにする
export namespace xpcMain {
  type BackendAgentResourceEntry =
    | ((...args: any) => Promise<any | void>)
    | IEventSource<any>;

  export function supplyBackendAgent<
    T extends Record<keyof T, BackendAgentResourceEntry>
  >(realm: string, backendAgentSource: T) {
    for (const key in backendAgentSource) {
      const sig = key;
      const entry = backendAgentSource[key] as BackendAgentResourceEntry;
      if (typeof entry === 'function') {
        //create async call rpc entries
        ipcMain.on(`XPC__${realm}__${sig}__call`, (event, ...args) => {
          entry(...args).then((result: any) => {
            event.sender.send(`XPC__${realm}__${sig}__reply`, result);
          });
        });
      } else if (entry.subscribe && entry.unsubscribe) {
        //create event subscriber rpc entries
        const handlersMap = new Map<string, (payload: any) => void>();
        ipcMain.on(
          `XPC__${realm}__${sig}__subscribe`,
          (event, subscriptionUuid) => {
            const handler = (payload: any) => {
              event.sender.send(`XPC__${realm}__${sig}__event`, payload);
            };
            entry.subscribe(handler);
            handlersMap.set(subscriptionUuid, handler);
          }
        );
        ipcMain.on(
          `XPC__${realm}__${sig}__unsubscribe`,
          (event, subscriptionUuid) => {
            const handler = handlersMap.get(subscriptionUuid);
            if (handler) {
              entry.unsubscribe(handler);
              handlersMap.delete(subscriptionUuid);
            }
          }
        );
      }
    }
  }
}
