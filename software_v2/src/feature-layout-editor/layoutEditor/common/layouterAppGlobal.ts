export const layouterAppGlobal = new (class {
  debugObject: any = {};

  get hasDebugValue() {
    return Object.keys(this.debugObject).length > 0;
  }

  setDebugValue(obj: any) {
    this.debugObject = { ...this.debugObject, ...obj };
  }
})();

export const layouterAppFeatures = {
  // 要素がスナップする座標をクロスヘアで表示するオプション
  // onMouseMoveで毎回描画を発生させているため、仮想DOMにより画面全体を更新する設計とは相性が悪い
  // onMouseMoveで画面全体を描画せず、カーソルの要素だけ属性を変更する実装にすれば使えるかもしれない
  showCoordCrosshair: false,
};
