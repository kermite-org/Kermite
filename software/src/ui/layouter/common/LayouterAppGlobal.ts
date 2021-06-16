export const layouterAppGlobal = new (class {
  debugObject: any = {};

  get hasDebugValue() {
    return Object.keys(this.debugObject).length > 0;
  }

  setDebugValue(obj: any) {
    this.debugObject = { ...this.debugObject, ...obj };
  }
})();
