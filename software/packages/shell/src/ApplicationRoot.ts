import { applicationStorage } from '~/base/ApplicationStorage';
import { appConfig } from '~/base/appConfig';
import { appGlobal } from '~/base/appGlobal';
import { preparePreloadJsFile } from '~/modules';
import {
  PageStateManager,
  AppWindowWrapper,
  MenuManager,
} from '~/windowServices';

export class ApplicationRoot {
  private pageManager = new PageStateManager();
  private windowWrapper = new AppWindowWrapper();
  private menuManager = new MenuManager();

  initialize() {
    preparePreloadJsFile(appConfig.preloadFilePath);
    applicationStorage.initialize();

    const win = this.windowWrapper.openMainWindow({
      preloadFilePath: appConfig.preloadFilePath,
      publicRootPath: appConfig.publicRootPath,
      pageTitle: appConfig.pageTitle,
      initialPageWidth: appConfig.initialPageWidth,
      initialPageHeight: appConfig.initialPageHeight,
    });
    appGlobal.mainWindow = win;
    appGlobal.icpMainAgent.setWebcontents(win.webContents);
    this.setupPageManager();
    this.setupMenu();

    this.setupIpcBackend();
  }

  private setupPageManager() {
    const { pageManager: pm, windowWrapper: ww } = this;
    pm.initialize();
    pm.onPagePathChanged((pagePath) => ww.loadPage(pagePath));
    pm.onDevToolVisibilityChanged((visible) =>
      ww.setDevToolsVisibility(visible),
    );
    const { currentPagePath, isDevToolsVisible } = pm;
    ww.setDevToolsVisibility(isDevToolsVisible);
    ww.loadPage(currentPagePath);
    if (isDevToolsVisible) {
      setTimeout(() => this.windowWrapper.reloadPage(), 500);
    }
  }

  private setupMenu() {
    const { menuManager: mm, pageManager: pm, windowWrapper: ww } = this;
    mm.buildMenu({
      allPagePaths: pm.allPagePaths,
      currentPagePath: pm.currentPagePath,
      isDevToolVisible: pm.isDevToolsVisible,
    });
    mm.onMenuCloseMainWindow(() => ww.closeMainWindow());
    mm.onMenuChangeCurrentPagePath((pagePath) =>
      pm.setCurrentPagePath(pagePath),
    );
    mm.onMenuRequestReload(() => ww.reloadPage());
    mm.onMenuToggleDevtoolVisibility(() =>
      pm.setDevToolVisiblity(!pm.isDevToolsVisible),
    );
  }

  setupIpcBackend() {
    const ww = this.windowWrapper;

    appGlobal.icpMainAgent.supplySyncHandlers({
      getVersionSync: () => 'v100',
      debugMessage: (msg) => console.log(`[renderer] ${msg}`),
    });
    appGlobal.icpMainAgent.supplyAsyncHandlers({
      getVersion: async () => 'v100',
      addNumber: async (a: number, b: number) => a + b,
      closeWindow: async () => ww.closeMainWindow(),
      minimizeWindow: async () => ww.minimizeMainWindow(),
      maximizeWindow: async () => ww.maximizeMainWindow(),
    });

    setTimeout(() => {
      appGlobal.icpMainAgent.emitEvent('testEvent', { type: 'test' });
    }, 2000);
  }

  terminate() {
    this.pageManager.terminate();
    console.log(`saving persist state`);
    applicationStorage.terminate();
  }
}
