import { rerender as qxRerender } from 'qx';

class AppUi {
  isDevelopment = (window as any).debugConfig?.isDevelopment;

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

  private _reqRenderAsync: boolean = false;

  rerender = () => {
    this._reqRenderAsync = true;
  };

  startAsyncRenderLoop() {
    const renderLoop = () => {
      if (this._reqRenderAsync) {
        qxRerender();
        this._reqRenderAsync = false;
      }
      requestAnimationFrame(renderLoop);
    };
    renderLoop();
  }

  navigateTo(path: string) {
    location.href = path;
  }
}
export const appUi = new AppUi();
