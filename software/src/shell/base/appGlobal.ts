import { IAppIpcContract } from '@shared';
import { IpcMainAgent } from '@shared/xpc2/IpcMainAgent';
import { BrowserWindow } from 'electron';

export const appGlobal = new (class {
  mainWindow: BrowserWindow | undefined = undefined;
  icpMainAgent = new IpcMainAgent<IAppIpcContract>();
})();
