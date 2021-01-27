import { IAppWindowEvent } from '~/shared';
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
  }): Electron.BrowserWindow;
  closeMainWindow(): void;
  loadPage(pagePath: string): void;
  reloadPage(): void;
  setDevToolsVisibility(visible: boolean): void;
  minimizeMainWindow(): void;
  maximizeMainWindow(): void;
  appWindowEventPort: IEventPort2<IAppWindowEvent>;
  restartApplication(): void;
  // onPageLoaded: IListenerPort<string>;
}

export interface IPageStateManager {
  allPagePaths: string[];
  currentPagePath: string;
  setCurrentPagePath(pagePath: string): void;
  onPagePathChanged: IListenerPort<string>;
  isDevToolsVisible: boolean;
  setDevToolVisiblity(visible: boolean): void;
  onDevToolVisibilityChanged: IListenerPort<boolean>;
  initialize(): void;
  terminate(): void;
}

export interface IWindowService {
  getWindowWrapper(): IAppWindowWrapper;
  initialize(): void;
  terminate(): void;
}
