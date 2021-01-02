export type IEventDelegate<T> = (listener: (payload: T) => void) => void;

export type IMenuCallbackEvent = Partial<{
  changeCurrentPagePath: { pagePath: string };
  requestReload: true;
  toggleDevtoolVisibility: true;
  closeMainWindow: true;
}>;
export interface IMenuManager {
  buildMenu(initailState: {
    allPagePaths: string[];
    currentPagePath: string;
    isDevToolVisible: boolean;
  }): void;
  handleEvents: IEventDelegate<IMenuCallbackEvent>;
}
