import { IAppIpcContract, IAppWindowEvent } from '@kermite/shared';
import { IpcMainAgent } from '@kermite/shared/lib/xpc2/IpcMainAgent';
import { BrowserWindow } from 'electron';
import { EventPort } from '~/funcs';

export const appGlobal = new (class {
  mainWindow: BrowserWindow | undefined = undefined;
  icpMainAgent = new IpcMainAgent<IAppIpcContract>();
})();

// ウインドウに関するイベントを中継するためのEventPort
export const appWindowEventHub = new EventPort<IAppWindowEvent>();
