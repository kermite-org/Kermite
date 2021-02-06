import { app, BrowserWindow } from 'electron';
import { IAppWindowEvent } from '~/shared';
import { appConfig, appEnv, applicationStorage } from '~/shell/base';
import { createEventPort2, pathJoin, pathRelative } from '~/shell/funcs';
import { IAppWindowWrapper } from './interfaces';
import { PageSourceWatcher, setupWebContentSourceChecker } from './modules';

export class AppWindowWrapper implements IAppWindowWrapper {
  private pageSourceWatcher = new PageSourceWatcher();

  private publicRootPath: string | undefined;

  private mainWindow: BrowserWindow | undefined;

  private isDevtoolsVisible = false;

  appWindowEventPort = createEventPort2<IAppWindowEvent>({
    initialValueGetter: () => ({
      devToolVisible: this.isDevtoolsVisible,
      isMaximized: this.mainWindow?.isMaximized() || false,
    }),
  });

  getMainWindow(): Electron.BrowserWindow {
    return this.mainWindow!;
  }

  openMainWindow(params: {
    preloadFilePath: string;
    publicRootPath: string;
    pageTitle: string;
    initialPageWidth: number;
    initialPageHeight: number;
  }) {
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

    if (!appConfig.isDevelopment) {
      options.frame = false;
      options.transparent = true;
    }

    const win = new BrowserWindow(options);
    this.mainWindow = win;
    setupWebContentSourceChecker(win.webContents, publicRootPath);
    this.publicRootPath = publicRootPath;

    app.on('browser-window-focus', () => {
      this.appWindowEventPort.emit({ activeChanged: true });
    });
    app.on('browser-window-blur', () => {
      this.appWindowEventPort.emit({ activeChanged: false });
    });

    win.webContents.on('devtools-opened', () => {
      this.isDevtoolsVisible = true;
      this.appWindowEventPort.emit({ devToolVisible: true });
    });
    win.webContents.on('devtools-closed', () => {
      this.isDevtoolsVisible = false;
      this.appWindowEventPort.emit({ devToolVisible: false });
    });

    win.on('maximize', () =>
      this.appWindowEventPort.emit({ isMaximized: true }),
    );
    win.on('unmaximize', () =>
      this.appWindowEventPort.emit({ isMaximized: false }),
    );

    if (appEnv.isDevelopment && this.isDevtoolsVisible) {
      this.setDevToolsVisibility(true);
    }
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

  maximizeMainWindow() {
    if (this.mainWindow) {
      // this.mainWindow.isMaximized() ... always returns false for transparent window (?)
      if (!this.mainWindow.isMaximized()) {
        this.mainWindow.maximize();
      } else {
        this.mainWindow.unmaximize();
      }
    }
  }

  restartApplication() {
    console.log('##REBOOT_ME_AFTER_CLOSE');
    this.closeMainWindow();
  }
  // private _winHeight = 800;

  // adjustWindowSize(isWidgetMode: boolean) {
  //   if (this.mainWindow) {
  //     const [w, h] = this.mainWindow.getSize();

  //     if (isWidgetMode) {
  //       this._winHeight = h;
  //       // todo: 現在選択されているプロファイルのキーボード形状データから縦横比を計算
  //       const asr = 0.4;
  //       const [w1, h1] = [w, (w * asr) >> 0];
  //       this.mainWindow.setSize(w1, h1);
  //       this.mainWindow.setAlwaysOnTop(true);
  //     } else {
  //       const [w1, h1] = [w, this._winHeight];
  //       this.mainWindow.setSize(w1, h1);
  //       this.mainWindow.setAlwaysOnTop(false);
  //     }
  //   }
  // }

  initialize() {
    const loadedState = applicationStorage.getItem('windowState');
    this.isDevtoolsVisible = loadedState.isDevtoolsVisible;
  }

  terminate() {
    applicationStorage.setItem('windowState', {
      isDevtoolsVisible: this.isDevtoolsVisible,
    });
  }
}
