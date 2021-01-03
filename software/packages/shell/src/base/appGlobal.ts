import { IAppIpcContract } from '@kermite/shared';
import { IpcMainAgent } from '@kermite/shared/lib/xpc2/IpcMainAgent';
import { BrowserWindow } from 'electron';

export const appGlobal = new (class {
  mainWindow: BrowserWindow | undefined = undefined;
  icpMainAgent = new IpcMainAgent<IAppIpcContract>();
})();
