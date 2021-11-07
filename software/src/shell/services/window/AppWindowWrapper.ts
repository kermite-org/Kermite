import { app, BrowserWindow, Rectangle } from 'electron';
import {
  getObjectKeys,
  IAppWindowStatus,
  vObject,
  vNumber,
  vString,
  vBoolean,
} from '~/shared';
import { DisplayKeyboardDesignLoader } from '~/shared/loaders/DisplayKeyboardDesignLoader';
import { appConfig, appEnv, appGlobal, applicationStorage } from '~/shell/base';
import { pathRelative } from '~/shell/funcs';
import {
  commitCoreState,
  coreState,
  createCoreModule,
  profilesReader,
} from '~/shell/modules/core';
import { MenuManager } from '~/shell/services/window/MenuManager';
import { IAppWindowWrapper } from './Interfaces';
import {
  PageSourceWatcher,
  preparePreloadJsFile,
  setupWebContentSourceChecker,
} from './helpers';

// const enableFilesWatcher = true;
const enableFilesWatcher = appEnv.isDevelopment;

interface IWindowPersistState {
  pagePath: string;
  isDevtoolsVisible: boolean;
  isWidgetAlwaysOnTop: boolean;
  mainWindowBounds?: Rectangle;
  widgetWindowBounds?: Rectangle;
  widgetProjectId?: string;
}

function makeFallbackWindowPersistState(): IWindowPersistState {
  return {
    pagePath: '/',
    isDevtoolsVisible: false,
    isWidgetAlwaysOnTop: false,
    mainWindowBounds: undefined,
    widgetWindowBounds: undefined,
    widgetProjectId: undefined,
  };
}

const makeRectangleSchema = () =>
  vObject({
    x: vNumber(),
    y: vNumber(),
    width: vNumber(),
    height: vNumber(),
  });

const windowStateSchema = vObject({
  pagePath: vString(),
  isDevtoolsVisible: vBoolean(),
  isWidgetAlwaysOnTop: vBoolean(),
  mainWindowBounds: makeRectangleSchema().optional,
  widgetWindowBounds: makeRectangleSchema().optional,
  widgetProjectId: vString().optional,
});

export class AppWindowWrapper implements IAppWindowWrapper {
  private menuManager = new MenuManager();
  private pageSourceWatcher = new PageSourceWatcher();
  private publicRootPath: string | undefined;
  private mainWindow: BrowserWindow | undefined;
  private state: IWindowPersistState = makeFallbackWindowPersistState();

  private commitWindowStatus(diff: Partial<IAppWindowStatus>) {
    const key = getObjectKeys(diff)[0];
    const value = diff[key];
    if (coreState.appWindowStatus[key] !== value) {
      const appWindowStatus = { ...coreState.appWindowStatus, ...diff };
      commitCoreState({ appWindowStatus });
    }
  }

  openMainWindow() {
    const {
      preloadFilePath,
      publicRootPath,
      pageTitle,
      initialPageWidth,
      initialPageHeight,
    } = appConfig;

    const recalledBounds = this.isWidgetMode
      ? this.state.widgetWindowBounds
      : this.state.mainWindowBounds;

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
        preload: preloadFilePath,
      },
    };

    if (!appConfig.isDevelopment) {
      options.frame = false;
      options.transparent = true;
      options.hasShadow = false;
    }

    const win = new BrowserWindow(options);
    this.mainWindow = win;
    setupWebContentSourceChecker(win.webContents, publicRootPath);
    this.publicRootPath = publicRootPath;

    appGlobal.mainWindow = win;
    appGlobal.icpMainAgent.setWebContents(win.webContents);

    if (appEnv.isDevelopment && this.state.isDevtoolsVisible) {
      this.setDevToolsVisibility(true);
    }

    if (this.state.isWidgetAlwaysOnTop) {
      this.setWidgetAlwaysOnTop(true);
    }

    this.affectAlwaysOnTopToWindow();

    this.loadInitialPage();

    app.on('browser-window-focus', () => {
      this.commitWindowStatus({ isActive: true });
    });
    app.on('browser-window-blur', () => {
      this.commitWindowStatus({ isActive: false });
    });

    win.webContents.on('devtools-opened', () => {
      this.state.isDevtoolsVisible = true;
      this.commitWindowStatus({ isDevtoolsVisible: true });
    });
    win.webContents.on('devtools-closed', () => {
      this.state.isDevtoolsVisible = false;
      this.commitWindowStatus({ isDevtoolsVisible: false });
    });

    win.on('maximize', () => this.commitWindowStatus({ isMaximized: true }));
    win.on('unmaximize', () => this.commitWindowStatus({ isMaximized: false }));

    win.on('moved', () => this.saveWindowSize());
    win.on('resized', () => this.saveWindowSize());

    win.webContents.on('did-navigate-in-page', (_, url) => {
      const pagePath = url.split('#')[1];
      const widgetModeChanging =
        pagePath === '/widget' || this.state.pagePath === '/widget';
      if (widgetModeChanging) {
        this.saveWindowSize();
        this.state.pagePath = pagePath;
        this.adjustWindowSizeOnModeChange();
        this.affectAlwaysOnTopToWindow();
      } else {
        this.state.pagePath = pagePath;
      }
    });
  }

  closeMainWindow() {
    this.mainWindow?.close();
  }

  private loadInitialPage() {
    if (!this.publicRootPath) {
      return;
    }
    const pageDir = this.publicRootPath;
    const uri = `file://${pageDir}/index.html#${this.state.pagePath}`;
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
    this.commitWindowStatus({ isDevtoolsVisible: visible });
  }

  private affectAlwaysOnTopToWindow() {
    const value = this.state.isWidgetAlwaysOnTop;
    this.mainWindow?.setAlwaysOnTop(this.isWidgetMode && value);
    this.commitWindowStatus({ isWidgetAlwaysOnTop: value });
  }

  setWidgetAlwaysOnTop(isWidgetAlwaysOnTop: boolean) {
    this.state.isWidgetAlwaysOnTop = isWidgetAlwaysOnTop;
    this.affectAlwaysOnTopToWindow();
  }

  minimizeMainWindow() {
    this.mainWindow?.minimize();
  }

  maximizeMainWindow() {
    if (this.mainWindow) {
      // this.mainWindow.isMaximized() ... always returns false for transparent window (?)
      if (!this.mainWindow.isMaximized()) {
        this.saveWindowSize();
        this.mainWindow.maximize();
      } else {
        this.mainWindow.unmaximize();
      }
      this.commitWindowStatus({
        isMaximized: this.mainWindow.isMaximized() || false,
      });
    }
  }

  restartApplication() {
    console.log('##REBOOT_ME_AFTER_CLOSE');
    this.closeMainWindow();
  }

  private get isWidgetMode() {
    return this.state.pagePath === '/widget';
  }

  // ウインドウサイズを保存
  private saveWindowSize() {
    if (this.mainWindow) {
      const bounds = this.mainWindow.getBounds();
      if (this.isWidgetMode) {
        this.state.widgetProjectId =
          profilesReader.getCurrentProfileProjectId();
        this.state.widgetWindowBounds = bounds;
      } else {
        this.state.mainWindowBounds = bounds;
      }
    }
  }

  private adjustWindowSizeOnModeChange() {
    if (!this.mainWindow) {
      return;
    }
    if (this.isWidgetMode) {
      const projectId = profilesReader.getCurrentProfileProjectId();
      if (
        projectId === this.state.widgetProjectId &&
        this.state.widgetWindowBounds
      ) {
        // widgetモードで前回表示していたものと同じキーボードを表示する場合前回表示時のウインドウサイズを復元する
        this.mainWindow.setBounds(this.state.widgetWindowBounds);
      } else {
        // widgetモーで前回と異なるキーボードを表示する場合デフォルトのウインドウサイズを算出して設定する
        const currentProfile = profilesReader.getCurrentProfile();
        if (currentProfile) {
          const design = DisplayKeyboardDesignLoader.loadDisplayKeyboardDesign(
            currentProfile.keyboardDesign,
          );
          const w = design.displayArea.width * 4;
          const h = design.displayArea.height * 4 + 40;
          this.mainWindow.setSize(w, h);
        }
      }
    } else {
      const bounds = this.state.mainWindowBounds;
      if (bounds) {
        this.mainWindow.setBounds(bounds);
      }
    }
  }

  private setupMenu() {
    const { menuManager: mm } = this;
    mm.buildMenu();
    mm.onMenuCloseMainWindow(this.closeMainWindow.bind(this));
    mm.onMenuRequestReload(this.reloadPage.bind(this));
    mm.onMenuRestartApplication(this.restartApplication.bind(this));
  }

  initialize() {
    this.state = applicationStorage.readItemSafe(
      'windowState',
      windowStateSchema,
      makeFallbackWindowPersistState,
    );
    // this.state.isDevtoolsVisible = true; // debug

    preparePreloadJsFile(appConfig.preloadFilePath);
    this.openMainWindow();
    this.setupMenu();
  }

  terminate() {
    applicationStorage.writeItem('windowState', this.state);
  }
}

export function createWindowModule(appWindow: AppWindowWrapper) {
  return createCoreModule({
    window_closeWindow: () => appWindow.closeMainWindow(),
    window_minimizeWindow: () => appWindow.minimizeMainWindow(),
    window_maximizeWindow: () => appWindow.maximizeMainWindow(),
    window_restartApplication: () => appWindow.restartApplication(),
    window_setDevToolVisibility: (visible) =>
      appWindow.setDevToolsVisibility(visible),
    window_setWidgetAlwaysOnTop: (alwaysOnTop) =>
      appWindow.setWidgetAlwaysOnTop(alwaysOnTop),
    window_reloadPage: () => appWindow.reloadPage(),
  });
}
