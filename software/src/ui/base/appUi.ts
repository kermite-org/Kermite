import { asyncRerender } from 'alumina';

class AppUi {
  // isDevelopment = (window as any).debugConfig?.isDevelopment;
  isDevelopment = process.env.NODE_ENV === 'development';

  // isExecutedInApp = (window as any).ipcRenderer !== undefined;
  isExecutedInApp = true;

  // processEnv = process.env;
  processEnv = {} as any;

  private _debugObject: any = {};

  get hasDebugValue() {
    return Object.keys(this._debugObject).length > 0;
  }

  setDebugValue(obj: any) {
    this._debugObject = { ...this._debugObject, ...obj };
  }

  get debugObject() {
    return this._debugObject;
  }

  rerender = () => {
    asyncRerender();
  };

  navigateTo(path: string) {
    location.href = path;
  }

  skipPageTerminationTasks = false;
}
export const appUi = new AppUi();
