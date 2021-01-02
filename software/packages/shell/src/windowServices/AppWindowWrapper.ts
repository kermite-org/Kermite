import { appConfig } from '~/base/appConfig';
import { pathJoin, pathRelative } from '~/funcs';
import { WindowWrapperCore, PageSourceWatcher } from '~/modules';
import { setupWebContentSourceChecker } from '~/modules/WindowsFunctionalities';

type IPacketMainToRenderer = { [key in string]: any };

export class AppWindowWrapper {
  private core = new WindowWrapperCore();
  private pageSourceWatcher = new PageSourceWatcher();

  private publicRootPath: string | undefined;

  openMainWindow = (params: {
    preloadFilePath: string;
    publicRootPath: string;
    pageTitle: string;
    initialPageWidth: number;
    initialPageHeight: number;
  }): Electron.BrowserWindow => {
    const {
      preloadFilePath,
      publicRootPath,
      pageTitle,
      initialPageWidth,
      initialPageHeight,
    } = params;
    const win = this.core.openMainWindow({
      preloadFilePath,
      pageTitle,
      width: initialPageWidth,
      height: initialPageHeight,
    });
    setupWebContentSourceChecker(win.webContents, publicRootPath);
    this.publicRootPath = publicRootPath;
    return win;
  };

  closeMainWindow = () => {
    this.core.closeMainWindow();
  };

  loadPage = (pagePath: string) => {
    const rootDir = this.publicRootPath;
    if (!rootDir) {
      return;
    }
    const pageDir = pathJoin(rootDir, pagePath !== '/' ? pagePath : '');
    const uri = `file://${pageDir}/index.html`;
    const relativeFilePathFromProjectRoot = pathRelative(
      process.cwd(),
      `${pageDir}/index.html`,
    );
    console.log(`loading ${relativeFilePathFromProjectRoot}`);
    this.core.loadUri(uri);

    if (appConfig.isDevelopment) {
      const includeSubFolders = true;
      this.pageSourceWatcher.observeFiles(pageDir, includeSubFolders, () =>
        this.core.reloadPage(),
      );
    }
  };

  reloadPage = () => {
    this.core.reloadPage();
  };

  setDevToolsVisibility = (visible: boolean) => {
    this.core.setDevToolsVisibility(visible);
  };

  sendWebContentsIpcPacket = <K extends keyof IPacketMainToRenderer>(
    key: K,
    data: IPacketMainToRenderer[K],
  ) => {
    this.core.webcontentsSend(key, data);
  };
}
