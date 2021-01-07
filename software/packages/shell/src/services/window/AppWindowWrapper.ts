import { IAppWindowEvent } from '@kermite/shared';
import { app, BrowserWindow } from 'electron';
import { appConfig } from '~/base';
import { makeListnerPort, pathJoin, pathRelative } from '~/funcs';
import { IAppWindowWrapper } from './interfaces';
import { PageSourceWatcher, setupWebContentSourceChecker } from './modules';

export class AppWindowWrapper implements IAppWindowWrapper {
  private pageSourceWatcher = new PageSourceWatcher();

  private publicRootPath: string | undefined;

  private mainWindow: BrowserWindow | undefined;

  // onPageLoaded = makeListnerPort<string>();

  onAppWindowEvent = makeListnerPort<IAppWindowEvent>();

  openMainWindow(params: {
    preloadFilePath: string;
    publicRootPath: string;
    pageTitle: string;
    initialPageWidth: number;
    initialPageHeight: number;
  }): Electron.BrowserWindow {
    const {
      preloadFilePath,
      publicRootPath,
      pageTitle,
      initialPageWidth,
      initialPageHeight,
    } = params;
    const options: Electron.BrowserWindowConstructorOptions = {
      width: initialPageWidth,
      height: initialPageHeight,
      title: pageTitle,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: true,
        worldSafeExecuteJavaScript: true,
        preload: preloadFilePath,
      },
    };
    const win = new BrowserWindow(options);
    this.mainWindow = win;
    setupWebContentSourceChecker(win.webContents, publicRootPath);
    this.publicRootPath = publicRootPath;

    app.on('browser-window-focus', () => {
      this.onAppWindowEvent.emit({ activeChanged: true });
    });
    app.on('browser-window-blur', () => {
      this.onAppWindowEvent.emit({ activeChanged: false });
    });

    return win;
  }

  closeMainWindow() {
    this.mainWindow?.close();
  }

  loadPage(pagePath: string) {
    if (!this.publicRootPath) {
      return;
    }
    const pageDir = pathJoin(
      this.publicRootPath,
      pagePath !== '/' ? pagePath : '',
    );
    const uri = `file://${pageDir}/index.html`;
    const relativeFilePathFromProjectRoot = pathRelative(
      process.cwd(),
      `${pageDir}/index.html`,
    );
    console.log(`loading ${relativeFilePathFromProjectRoot}`);
    this.mainWindow?.loadURL(uri);

    if (appConfig.isDevelopment) {
      const includeSubFolders = true;
      this.pageSourceWatcher.observeFiles(pageDir, includeSubFolders, () =>
        this.mainWindow?.reload(),
      );
    }

    // this.onPageLoaded.emit(pagePath);
  }

  reloadPage() {
    this.mainWindow?.reload();
  }

  setDevToolsVisibility(visible: boolean) {
    if (visible) {
      this.mainWindow?.webContents.openDevTools();
    } else {
      this.mainWindow?.webContents.closeDevTools();
    }
  }

  minimizeMainWindow() {
    this.mainWindow?.minimize();
  }

  private _isMaximized = false;

  maximizeMainWindow() {
    if (this.mainWindow) {
      // const isMaximized = this.mainWindow.isMaximized()
      // ...always returns false for transparent window
      if (this._isMaximized) {
        this.mainWindow.unmaximize();
        this._isMaximized = false;
      } else {
        this.mainWindow.maximize();
        this._isMaximized = true;
      }
    }
  }
}
