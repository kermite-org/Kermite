import { IAppWindowStatus } from '~/shared';
import { IListenerPort } from '~/shell/base';
import { IEventPort2 } from '~/shell/funcs';

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
