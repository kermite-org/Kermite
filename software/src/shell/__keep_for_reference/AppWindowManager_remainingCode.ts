import { BrowserWindow } from 'electron';

export class AppWindowManager {
  private mainWindow: BrowserWindow | null = null;

  private _winHeight = 800;

  adjustWindowSize(isWidgetMode: boolean) {
    if (this.mainWindow) {
      const [w, h] = this.mainWindow.getSize();

      if (isWidgetMode) {
        this._winHeight = h;
        // todo: 現在選択されているプロファイルのキーボード形状データから縦横比を計算
        const asr = 0.4;
        const [w1, h1] = [w, (w * asr) >> 0];
        this.mainWindow.setSize(w1, h1);
        this.mainWindow.setAlwaysOnTop(true);
      } else {
        const [w1, h1] = [w, this._winHeight];
        this.mainWindow.setSize(w1, h1);
        this.mainWindow.setAlwaysOnTop(false);
      }
    }
  }
}

export const appWindowManager = new AppWindowManager();
