import { appGlobal, appConfig } from '~/shell/base';
import { AppWindowWrapper } from './AppWindowWrapper';
import { MenuManager } from './MenuManager';
import { IWindowService } from './interfaces';
import { preparePreloadJsFile } from './modules';

export class WindowService implements IWindowService {
  private windowWrapper = new AppWindowWrapper();
  private menuManager = new MenuManager();

  getWindowWrapper(): AppWindowWrapper {
    return this.windowWrapper;
  }

  private setupMenu() {
    const { menuManager: mm, windowWrapper: ww } = this;
    mm.buildMenu();
    mm.onMenuCloseMainWindow(() => ww.closeMainWindow());
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
    this.setupMenu();
  }

  terminate() {
    this.windowWrapper.terminate();
  }
}
