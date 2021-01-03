import { appConfig } from '~/base/appConfig';
import { appGlobal } from '~/base/appGlobal';
import {
  enumeratePagePaths,
  preparePreloadJsFile,
} from '~/modules/WindowsFunctionalities';
import { setupIpcBackend } from '~/services/IpcBackend';
import {
  PageStateManager,
  AppWindowWrapper,
  MenuManager,
} from '~/windowServices';
import { AppStatePersistence } from '~/windowServices/AppStatePersistence';

export class ApplicationRoot {
  private persistence = new AppStatePersistence();
  private pageManager = new PageStateManager();
  private windowWrapper = new AppWindowWrapper();
  private menuManager = new MenuManager();

  private setupPageManager() {
    const allPagePaths = enumeratePagePaths(appConfig.publicRootPath);
    const loadedState = this.persistence.load();
    this.pageManager.initialize(loadedState, allPagePaths);
    this.pageManager.onPagePathChanged(this.windowWrapper.loadPage);
    this.pageManager.onDevToolVisibilityChanged(
      this.windowWrapper.setDevToolsVisibility,
    );
    const { currentPagePath, isDevToolsVisible } = this.pageManager;
    this.windowWrapper.setDevToolsVisibility(isDevToolsVisible);
    this.windowWrapper.loadPage(currentPagePath);
    if (isDevToolsVisible) {
      setTimeout(() => this.windowWrapper.reloadPage(), 500);
    }
  }

  private setupMenu() {
    const { menuManager, pageManager: pm } = this;
    menuManager.buildMenu({
      allPagePaths: pm.allPagePaths,
      currentPagePath: pm.currentPagePath,
      isDevToolVisible: pm.isDevToolsVisible,
    });
    menuManager.handleEvents((event) => {
      if (event.changeCurrentPagePath) {
        const { pagePath } = event.changeCurrentPagePath;
        pm.setCurrentPagePath(pagePath);
      }
      if (event.requestReload) {
        this.windowWrapper.reloadPage();
      }
      if (event.toggleDevtoolVisibility) {
        pm.setDevToolVisiblity(!pm.isDevToolsVisible);
      }
      if (event.closeMainWindow) {
        this.windowWrapper.closeMainWindow();
      }
    });
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

    setupIpcBackend();
  }

  terminate() {
    console.log(`saving window persist state`);
    const persiteData = this.pageManager.terminate();
    this.persistence.save(persiteData);
  }
}
