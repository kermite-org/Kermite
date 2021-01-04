export type IListenerPort<T> = (listener: (payload: T) => void) => void;

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
