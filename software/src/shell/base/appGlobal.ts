import { BrowserWindow } from 'electron';
import { IAppIpcContract, IProfileData } from '~/shared';
import { IpcMainAgent } from '~/shared/xpc2/IpcMainAgent';

// interface IAppInternalEvents {
//   keyboardConfigChanged: IKeyboardConfig;
// }
export const appGlobal = new (class {
  mainWindow: BrowserWindow | undefined = undefined;
  icpMainAgent = new IpcMainAgent<IAppIpcContract>();

  currentProfileGetter: (() => IProfileData | undefined) | undefined;
  // eventBus = new TypedEventEmitter<IAppInternalEvents>();
})();
