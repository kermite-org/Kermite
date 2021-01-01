import { rerender as qxRerender } from '~qx';

export const appUi = new (class {
  private _debugObject?: any;

  // バックエンドから環境変数を取得する場合、グローバルスコープで参照したり、
  // バックエンドから値が帰ってくる前に参照すると正しい値が得られない問題がある
  // 代替としてlocation.protocolでデバッグ実行中かを判定
  // todo: preload.jsでBE-->FEに環境変数を受け渡す?
  isDevelopment = location.protocol === 'http:';

  private reqRenderAsync: boolean = false;

  rerender = () => {
    this.reqRenderAsync = true;
  };

  startAsyncRenderLoop() {
    const renderLoop = () => {
      if (this.reqRenderAsync) {
        qxRerender();
        this.reqRenderAsync = false;
      }
      requestAnimationFrame(renderLoop);
    };
    renderLoop();
  }

  get debugObject() {
    return this._debugObject;
  }

  setDebugObject(obj: any) {
    this._debugObject = obj;
  }
})();
