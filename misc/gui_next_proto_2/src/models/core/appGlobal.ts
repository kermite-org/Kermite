export const app = new (class {
  private _debugObject?: any;

  reqRerender: boolean = false;

  rerender() {
    this.reqRerender = true;
  }

  get debugObject() {
    return this._debugObject;
  }

  setDebugObject(obj: any) {
    this._debugObject = obj;
    this.reqRerender = true;
  }
})();
