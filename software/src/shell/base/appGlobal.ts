import { BrowserWindow } from 'electron';
import { IAppErrorData, IAppIpcContract } from '~/shared';
import { IpcMainAgent } from '~/shared/xpc2/IpcMainAgent';
import { createEventPort2 } from '~/shell/funcs';

// interface IAppInternalEvents {
//   keyboardConfigChanged: IKeyboardConfig;
// }
export const appGlobal = new (class {
  mainWindow: BrowserWindow | undefined = undefined;
  icpMainAgent = new IpcMainAgent<IAppIpcContract>();
  // eventBus = new TypedEventEmitter<IAppInternalEvents>();
  appErrorEventPort = createEventPort2<IAppErrorData<any>>();
})();
