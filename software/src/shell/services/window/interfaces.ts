import { IAppWindowStatus } from '~/shared';
import { IListenerPort } from '~/shell/base';
import { IEventPort2 } from '~/shell/funcs';

export interface IMenuManager {
  buildMenu(initailState: {
    allPagePaths: string[];
    currentPagePath: string;
    isDevToolVisible: boolean;
  }): void;
  onMenuChangeCurrentPagePath: IListenerPort<string>;
  onMenuRequestReload: IListenerPort<void>;
  onMenuToggleDevtoolVisibility: IListenerPort<void>;
  onMenuCloseMainWindow: IListenerPort<void>;
  onMenuRestartApplication: IListenerPort<void>;
}

export interface IAppWindowWrapper {
  openMainWindow(params: {
    preloadFilePath: string;
    publicRootPath: string;
    pageTitle: string;
    initialPageWidth: number;
    initialPageHeight: number;
  }): void;
  closeMainWindow(): void;
  getMainWindow(): Electron.BrowserWindow;
  loadPage(pagePath: string): void;
  reloadPage(): void;
  setDevToolsVisibility(visible: boolean): void;
  minimizeMainWindow(): void;
  maximizeMainWindow(): void;
  appWindowEventPort: IEventPort2<Partial<IAppWindowStatus>>;
  restartApplication(): void;
  // onPageLoaded: IListenerPort<string>;
}

export interface IPageStateManager {
  allPagePaths: string[];
  currentPagePath: string;
  setCurrentPagePath(pagePath: string): void;
  onPagePathChanged: IListenerPort<string>;
  initialize(): void;
  terminate(): void;
}

export interface IWindowService {
  getWindowWrapper(): IAppWindowWrapper;
  initialize(): void;
  terminate(): void;
}
