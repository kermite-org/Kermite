import { BrowserWindow } from 'electron';
import { IAppErrorData, IAppIpcContract } from '~/shared';
import { IpcMainAgent } from '~/shared/xpc/IpcMainAgent';
import { createEventPort } from '~/shell/funcs';

// interface IAppInternalEvents {
//   keyboardConfigChanged: IKeyboardConfig;
// }
export const appGlobal = new (class {
  mainWindow: BrowserWindow | undefined = undefined;
  icpMainAgent = new IpcMainAgent<IAppIpcContract>();
  // eventBus = new TypedEventEmitter<IAppInternalEvents>();
  appErrorEventPort = createEventPort<IAppErrorData<any>>();

  getSimulatorMode = () => false;
})();
