import { BrowserWindow } from 'electron';

export class WindowWrapperCore {
  private mainWindow: BrowserWindow | undefined;

  openMainWindow(params: {
    preloadFilePath: string;
    pageTitle: string;
    width: number;
    height: number;
  }) {
    const { preloadFilePath, pageTitle, width, height } = params;
    const options: Electron.BrowserWindowConstructorOptions = {
      width,
      height,
      title: pageTitle,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: true,
        worldSafeExecuteJavaScript: true,
        preload: preloadFilePath,
      },
    };
    this.mainWindow = new BrowserWindow(options);
    return this.mainWindow;
  }

  closeMainWindow() {
    this.mainWindow?.close();
  }

  reloadPage() {
    this.mainWindow?.reload();
  }

  webcontentsSend(channel: string, data: any) {
    this.mainWindow?.webContents.send(channel, data);
  }

  setDevToolsVisibility(visible: boolean) {
    if (visible) {
      this.mainWindow?.webContents.openDevTools();
    } else {
      this.mainWindow?.webContents.closeDevTools();
    }
  }

  loadUri(uri: string) {
    this.mainWindow?.loadURL(uri);
  }
}
