import { BrowserWindow } from 'electron';
import { IAppIpcContract, IProfileData } from '~/shared';
import { IpcMainAgent } from '~/shared/xpc2/IpcMainAgent';

export const appGlobal = new (class {
  mainWindow: BrowserWindow | undefined = undefined;
  icpMainAgent = new IpcMainAgent<IAppIpcContract>();

  currentProfileGetter: (() => IProfileData | undefined) | undefined;
})();
