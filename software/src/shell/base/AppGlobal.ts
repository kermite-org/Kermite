// import { BrowserWindow } from 'electron';
import { IAppErrorData, IAppIpcContract } from '~/shared';
import { createIpcAgentBypassed } from '~/shared/xpc/IpcAgentBypassed';
import { createEventPort } from '~/shell/funcs';

export const appGlobal = new (class {
  // mainWindow: BrowserWindow | undefined = undefined;
  // icpMainAgent = new IpcMainAgent<IAppIpcContract>();
  ipcMainAgent = createIpcAgentBypassed<IAppIpcContract>();
  appErrorEventPort = createEventPort<IAppErrorData<any>>();
  getSimulatorMode = () => false;
})();
