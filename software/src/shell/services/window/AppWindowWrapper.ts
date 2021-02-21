import { app, BrowserWindow, Rectangle } from 'electron';
import { IAppWindowStatus } from '~/shared';
import { DisplayKeyboardDesignLoader } from '~/shared/modules/DisplayKeyboardDesignLoader';
import {
  vObject,
  vNumber,
  vString,
  vBoolean,
} from '~/shared/modules/SchemaValidationHelper';
import { appConfig, appEnv, appGlobal, applicationStorage } from '~/shell/base';
import { createEventPort2, pathRelative } from '~/shell/funcs';
import { IProfileManager } from '~/shell/services/profile/interfaces';
import { MenuManager } from '~/shell/services/window/MenuManager';
import { IAppWindowWrapper } from './interfaces';
import {
  PageSourceWatcher,
  preparePreloadJsFile,
  setupWebContentSourceChecker,
} from './modules';

const enableFilesWatcher = true;
// const enableFilesWatcher = appEnv.isDevelopment;

interface IWindowPersistState {
  pagePath: string;
  isDevtoolsVisible: boolean;
  placement: {
    main?: {
      bounds: Rectangle;
    };
    widget?: {
      projectId: string;
      bounds: Rectangle;
    };
  };
}

function makeFallbackWindowPersistState(): IWindowPersistState {
  return {
    pagePath: '/',
    isDevtoolsVisible: false,
    placement: {
      main: undefined,
      widget: undefined,
    },
  };
}

const rectangleSchema = vObject({
  x: vNumber(),
  y: vNumber(),
  width: vNumber(),
  height: vNumber(),
});

const windowStateSchema = vObject({
  pagePath: vString(),
  isDevtoolsVisible: vBoolean(),
  placement: vObject({
    main: vObject({
      bounds: rectangleSchema,
    }).optional,
    widget: vObject({
      projectId: vString(),
      bounds: rectangleSchema,
    }).optional,
  }),
});

export class AppWindowWrapper implements IAppWindowWrapper {
  private menuManager = new MenuManager();
  private pageSourceWatcher = new PageSourceWatcher();
  private publicRootPath: string | undefined;
  private mainWindow: BrowserWindow | undefined;
  private state: IWindowPersistState = makeFallbackWindowPersistState();

  constructor(private profileManager: IProfileManager) {}

  appWindowEventPort = createEventPort2<Partial<IAppWindowStatus>>({
    initialValueGetter: () => ({
      isDevtoolsVisible: this.state.isDevtoolsVisible,
      isMaximized: this.mainWindow?.isMaximized() || false,
    }),
  });

  openMainWindow() {
    const {
      preloadFilePath,
      publicRootPath,
      pageTitle,
      initialPageWidth,
      initialPageHeight,
    } = appConfig;

    const recalledBounds = this.isWidgetMode
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
      options.hasShadow = false;
    }

    const win = new BrowserWindow(options);
    this.mainWindow = win;
    setupWebContentSourceChecker(win.webContents, publicRootPath);
    this.publicRootPath = publicRootPath;

    appGlobal.mainWindow = win;
    appGlobal.icpMainAgent.setWebcontents(win.webContents);

    if (appEnv.isDevelopment && this.state.isDevtoolsVisible) {
      this.setDevToolsVisibility(true);
    }

    this.loadInitialPage();

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

    win.webContents.on('did-navigate-in-page', (_, url) => {
      const pagePath = url.split('#')[1];
      const widgetModeChanging = [pagePath, this.state.pagePath].some(
        (it) => it === '/widget',
      );
      if (widgetModeChanging) {
        this.reserveWindowSize();
        this.state.pagePath = pagePath;
        this.adjustWindowSize();
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

  private get isWidgetMode() {
    return this.state.pagePath === '/widget';
  }

  private reserveWindowSize() {
    if (this.mainWindow) {
      const bounds = this.mainWindow.getBounds();
      if (this.isWidgetMode) {
        const currentProfile = this.profileManager.getCurrentProfile();
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
    if (!this.mainWindow) {
      return;
    }
    if (this.isWidgetMode) {
      const currentProfile = this.profileManager.getCurrentProfile();
      if (!currentProfile) {
        return;
      }
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
    preparePreloadJsFile(appConfig.preloadFilePath);
    this.openMainWindow();
    this.setupMenu();
  }

  terminate() {
    if (this.mainWindow?.isVisible()) {
      this.reserveWindowSize();
    }
    applicationStorage.writeItem('windowState', this.state);
  }
}
