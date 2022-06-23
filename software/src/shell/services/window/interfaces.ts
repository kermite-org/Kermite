import { IListenerPort } from '~/shell/base';

export interface IMenuManager {
  buildMenu(): void;
  onMenuRequestReload: IListenerPort<void>;
  onMenuCloseMainWindow: IListenerPort<void>;
  onMenuRestartApplication: IListenerPort<void>;
}

export interface IAppWindowWrapper {
  openMainWindow(): void;
  closeMainWindow(): void;
  reloadPage(): void;
  setDevToolsVisibility(visible: boolean): void;
  minimizeMainWindow(): void;
  maximizeMainWindow(): void;
  restartApplication(): void;
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
