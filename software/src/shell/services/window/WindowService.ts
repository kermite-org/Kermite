import { appGlobal, appConfig } from '~/shell/base';
import { AppWindowWrapper } from './AppWindowWrapper';
import { MenuManager } from './MenuManager';
import { PageStateManager } from './PageStateManager';
import {
  IAppWindowWrapper,
  IPageStateManager,
  IWindowService,
} from './interfaces';
import { preparePreloadJsFile } from './modules';

export class WindowService implements IWindowService {
  private pageManager = new PageStateManager();
  private windowWrapper = new AppWindowWrapper();
  private menuManager = new MenuManager();

  getPageManager(): IPageStateManager {
    return this.pageManager;
  }

  getWindowWrapper(): IAppWindowWrapper {
    return this.windowWrapper;
  }

  private setupPageManager() {
    const { pageManager: pm, windowWrapper: ww } = this;
    pm.initialize();
    pm.onPagePathChanged((pagePath) => ww.loadPage(pagePath));
    const { currentPagePath } = pm;
    ww.loadPage(currentPagePath);
  }

  private setupMenu() {
    const { menuManager: mm, pageManager: pm, windowWrapper: ww } = this;
    mm.buildMenu({
      allPagePaths: pm.allPagePaths,
      currentPagePath: pm.currentPagePath,
    });
    mm.onMenuCloseMainWindow(() => ww.closeMainWindow());
    mm.onMenuChangeCurrentPagePath((pagePath) =>
      pm.setCurrentPagePath(pagePath),
    );
    mm.onMenuRequestReload(() => ww.reloadPage());
    mm.onMenuRestartApplication(() => ww.restartApplication());
  }

  initialize() {
    preparePreloadJsFile(appConfig.preloadFilePath);
    this.windowWrapper.initialize();
    this.windowWrapper.openMainWindow({
      preloadFilePath: appConfig.preloadFilePath,
      publicRootPath: appConfig.publicRootPath,
      pageTitle: appConfig.pageTitle,
      initialPageWidth: appConfig.initialPageWidth,
      initialPageHeight: appConfig.initialPageHeight,
    });
    const win = this.windowWrapper.getMainWindow();
    appGlobal.mainWindow = win;
    appGlobal.icpMainAgent.setWebcontents(win.webContents);
    this.setupPageManager();
    this.setupMenu();
  }

  terminate() {
    this.pageManager.terminate();
    this.windowWrapper.terminate();
  }
}
