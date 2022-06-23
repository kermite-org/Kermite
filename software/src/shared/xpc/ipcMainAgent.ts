// import { ipcMain } from 'electron';
// import { IIpcContractBase } from './IpcContractBase';

// type IErrorHandler = (error: any) => void;
// export interface IIpcMainAgent<T extends IIpcContractBase> {
//   setWebContents(webContents: Electron.WebContents): void;
//   setErrorHandler(errorHandler: IErrorHandler): void;
//   supplySyncHandlers(handlers: T['sync']): void;
//   supplyAsyncHandlers(handlers: T['async']): void;
//   supplySubscriptionHandlers(handlers: {
//     [K in keyof T['events']]: (
//       cb: (value: T['events'][K]) => void,
//     ) => () => void;
//   }): void;
// }

// export class IpcMainAgent<T extends IIpcContractBase>
//   implements IIpcMainAgent<T>
// {
//   private webContents: Electron.WebContents | undefined;

//   private errorHandler: IErrorHandler = console.error;

//   setErrorHandler(errorHandler: IErrorHandler) {
//     this.errorHandler = errorHandler;
//   }

//   setWebContents(webContents: Electron.WebContents): void {
//     this.webContents = webContents;
//   }

//   supplySyncHandlers(handlers: T['sync']): void {
//     for (const key in handlers) {
//       const handler = handlers[key];
//       ipcMain.on(key, (event, ...args) => {
//         try {
//           event.returnValue = handler(...args);
//         } catch (error) {
//           this.errorHandler(error);
//         }
//       });
//     }
//   }

//   supplyAsyncHandlers(handlers: T['async']): void {
//     for (const key in handlers) {
//       const handler = handlers[key];
//       ipcMain.handle(key, async (event, ...args) => {
//         try {
//           return await handler(...args);
//         } catch (error) {
//           this.errorHandler(error);
//         }
//       });
//     }
//   }

//   private unsubMap: { [key: string]: any } = {};

//   supplySubscriptionHandlers(handlers: {
//     [K in keyof T['events']]: (
//       cb: (value: T['events'][K]) => void,
//     ) => () => void;
//   }) {
//     // let num = 0;
//     for (const propKey in handlers) {
//       const handler = handlers[propKey]!;
//       ipcMain.handle(
//         `__subscriptionStarted__${propKey}`,
//         (event, subscriptionKey) => {
//           // console.log(`subscriptionStarted ${subscriptionKey}, ${++num}`);
//           const callback = (value: any) => {
//             this.webContents?.send(subscriptionKey, value);
//           };
//           const unsub = handler(callback);
//           this.unsubMap[subscriptionKey] = unsub;
//         },
//       );
//       ipcMain.handle(
//         `__subscriptionEnded__${propKey}`,
//         (event, subscriptionKey) => {
//           // console.log(`subscriptionEnded ${subscriptionKey}, ${--num}`);
//           const unsub = this.unsubMap[subscriptionKey];
//           unsub?.();
//           delete this.unsubMap[subscriptionKey];
//         },
//       );
//     }
//   }
// }
