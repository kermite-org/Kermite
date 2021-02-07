import { app, BrowserWindow } from 'electron';
import { IAppWindowStatus } from '~/shared';
import { DisplayKeyboardDesignLoader } from '~/shared/modules/DisplayKeyboardDesignLoader';
import {
  appConfig,
  appEnv,
  appGlobal,
  applicationStorage,
  IWindowPersistState,
  makeFallbackWindowPersistState,
} from '~/shell/base';
import { createEventPort2, pathJoin, pathRelative } from '~/shell/funcs';
import { IAppWindowWrapper } from './interfaces';
import { PageSourceWatcher, setupWebContentSourceChecker } from './modules';

const enableFilesWatcher = true;
// const enableFilesWatcher = appEnv.isDevelopment;
export class AppWindowWrapper implements IAppWindowWrapper {
  private pageSourceWatcher = new PageSourceWatcher();

  private publicRootPath: string | undefined;

  private mainWindow: BrowserWindow | undefined;

  private state: IWindowPersistState = makeFallbackWindowPersistState();

  appWindowEventPort = createEventPort2<Partial<IAppWindowStatus>>({
    initialValueGetter: () => ({
      isWidgetMode: this.state.isWidgetMode,
      isDevtoolsVisible: this.state.isDevtoolsVisible,
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

    const recalledBounds = this.state.isWidgetMode
      ? this.state.placement.widget?.bounds
      : this.state.placement.main?.bounds;

    const options: Electron.BrowserWindowConstructorOptions = {
      x: recalledBounds?.x,
      y: recalledBounds?.y,
      width: recalledBounds?.width || initialPageWidth,
      height: recalledBounds?.height || initialPageHeight,
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
      this.appWindowEventPort.emit({ isActive: true });
    });
    app.on('browser-window-blur', () => {
      this.appWindowEventPort.emit({ isActive: false });
    });

    win.webContents.on('devtools-opened', () => {
      this.state.isDevtoolsVisible = true;
      this.appWindowEventPort.emit({ isDevtoolsVisible: true });
    });
    win.webContents.on('devtools-closed', () => {
      this.state.isDevtoolsVisible = false;
      this.appWindowEventPort.emit({ isDevtoolsVisible: false });
    });

    win.on('maximize', () =>
      this.appWindowEventPort.emit({ isMaximized: true }),
    );
    win.on('unmaximize', () =>
      this.appWindowEventPort.emit({ isMaximized: false }),
    );

    if (appEnv.isDevelopment && this.state.isDevtoolsVisible) {
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

    if (enableFilesWatcher) {
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

  setWidgetMode(isWidgetMode: boolean) {
    this.reserveWindowSize();
    this.state.isWidgetMode = isWidgetMode;
    this.appWindowEventPort.emit({ isWidgetMode });
    this.adjustWindowSize();
  }

  minimizeMainWindow() {
    this.mainWindow?.minimize();
  }

  maximizeMainWindow() {
    if (this.mainWindow) {
      // this.mainWindow.isMaximized() ... always returns false for transparent window (?)
      if (!this.mainWindow.isMaximized()) {
        this.reserveWindowSize();
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

  private reserveWindowSize() {
    if (this.mainWindow) {
      const bounds = this.mainWindow.getBounds();
      if (this.state.isWidgetMode) {
        const currentProfile = appGlobal.currentProfileGetter?.();
        if (currentProfile) {
          this.state.placement.widget = {
            projectId: currentProfile.projectId,
            bounds,
          };
        }
      } else {
        this.state.placement.main = { bounds };
      }
    }
  }

  private adjustWindowSize() {
    const currentProfile = appGlobal.currentProfileGetter?.();
    if (!this.mainWindow || !currentProfile) {
      return;
    }
    if (this.state.isWidgetMode) {
      if (currentProfile.projectId === this.state.placement.widget?.projectId) {
        this.mainWindow.setBounds(this.state.placement.widget.bounds);
      } else {
        const design = DisplayKeyboardDesignLoader.loadDisplayKeyboardDesign(
          currentProfile.keyboardDesign,
        );
        const w = design.displayArea.width * 4;
        const h = design.displayArea.height * 4 + 40;
        this.mainWindow.setSize(w, h);
        this.mainWindow.setAlwaysOnTop(true);
      }
    } else {
      const bounds = this.state.placement.main?.bounds;
      if (bounds) {
        this.mainWindow.setBounds(bounds);
      }
      this.mainWindow.setAlwaysOnTop(false);
    }
  }

  initialize() {
    this.state = applicationStorage.getItem('windowState');
  }

  terminate() {
    if (this.mainWindow?.isVisible()) {
      this.reserveWindowSize();
    }
    applicationStorage.setItem('windowState', this.state);
  }
}
