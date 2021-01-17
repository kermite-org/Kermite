import { appGlobal, appConfig } from '~/shell/base';
import { AppWindowWrapper } from './AppWindowWrapper';
import { MenuManager } from './MenuManager';
import { PageStateManager } from './PageStateManager';
import { IAppWindowWrapper, IWindowService } from './interfaces';
import { preparePreloadJsFile } from './modules';

export class WindowService implements IWindowService {
  private pageManager = new PageStateManager();
  private windowWrapper = new AppWindowWrapper();
  private menuManager = new MenuManager();

  getWindowWrapper(): IAppWindowWrapper {
    return this.windowWrapper;
  }

  initialize() {
    preparePreloadJsFile(appConfig.preloadFilePath);

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
      // setTimeout(() => this.windowWrapper.reloadPage(), 500);
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
    mm.onMenuRestartApplication(() => ww.restartApplication());
  }

  terminate() {
    this.pageManager.terminate();
  }
}
