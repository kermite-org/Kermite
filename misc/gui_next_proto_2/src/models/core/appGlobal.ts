export const app = new (class {
  debugObject?: any;
  reqRerender: boolean = false;
  rerender() {
    this.reqRerender = true;
  }

  setDebugObject(obj: any) {
    this.debugObject = obj;
    this.reqRerender = true;
  }
})();
