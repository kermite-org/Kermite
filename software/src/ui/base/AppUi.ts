import { asyncRerender } from 'alumina';

class AppUi {
  isDevelopment = (window as any).debugConfig?.isDevelopment;

  isExecutedInApp = (window as any).ipcRenderer !== undefined;

  processEnv = (window as any).processEnv;

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
}
export const appUi = new AppUi();
