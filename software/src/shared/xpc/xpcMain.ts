import { ipcMain } from 'electron';
import { IEventSource } from './types';
import 'reflect-metadata';

const rpcFunctionMetatadataKey = Symbol('RpcFunction');
const rpcEventSourceMetadataKey = Symbol('RpcFunction');

// RPCで呼ばれるメソッドに付与するデコレータ
export function RpcFunction(target: any, propertyKey: string) {
  Reflect.defineMetadata(rpcFunctionMetatadataKey, true, target, propertyKey);
}

// RPCで呼ばれるイベントソースに付与するデコレータ
export function RpcEventSource(target: any, propertyKey: string) {
  Reflect.defineMetadata(rpcEventSourceMetadataKey, true, target, propertyKey);
}

// IPCのラッパ, メインプロセス側
// メインプロセスで用意した関数を、レンダラプロセスから同一のインターフェイスで呼べるようにする
export namespace xpcMain {
  type BackendAgentResourceEntry =
    | ((...args: any) => Promise<any>)
    | IEventSource<any>;

  export function supplyBackendAgent<
    T extends Record<keyof T, BackendAgentResourceEntry>
  >(realm: string, backendAgentSource: T) {
    const propNames = [
      ...Object.getOwnPropertyNames(Object.getPrototypeOf(backendAgentSource)),
      ...Object.getOwnPropertyNames(backendAgentSource)
    ];

    for (const key of propNames) {
      const sig = key;
      const entry = backendAgentSource[
        key as keyof T
      ] as BackendAgentResourceEntry;

      const isRpcFunction = Reflect.getMetadata(
        rpcFunctionMetatadataKey,
        backendAgentSource,
        key
      );
      const isRpcEventSource = Reflect.getMetadata(
        rpcEventSourceMetadataKey,
        backendAgentSource,
        key
      );

      if (typeof entry === 'function' && isRpcFunction) {
        // console.log(`register rpc function ${key}`);
        // create async call rpc entry
        ipcMain.on(`XPC__${realm}__${sig}__call`, (event, ...args) => {
          (backendAgentSource[key as keyof T] as (
            ...args: any
          ) => Promise<any>)(...args).then((result: any) => {
            event.sender.send(`XPC__${realm}__${sig}__reply`, result);
          });
        });
      }
      if (
        typeof entry === 'object' &&
        entry.subscribe &&
        entry.unsubscribe &&
        isRpcEventSource
      ) {
        // console.log(`register rpc event source ${key}`);
        // create event subscriber rpc entry
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
