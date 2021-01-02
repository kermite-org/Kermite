import { makeListnerPort } from '~/funcs';

interface IAppPersistDataPageStatePartial {
  currentPagePath: string;
  isDevToolsVisible: boolean;
}

export class PageStateManager {
  private _allPagePaths: string[] = [];
  private _currentPagePath: string = '/';
  private _isDevToolsVisible: boolean = false;

  onPagePathChanged = makeListnerPort<string>();
  onDevToolVisibilityChanged = makeListnerPort<boolean>();

  get allPagePaths() {
    return this._allPagePaths;
  }

  get currentPagePath() {
    return this._currentPagePath;
  }

  get isDevToolsVisible() {
    return this._isDevToolsVisible;
  }

  setCurrentPagePath(pagePath: string) {
    this._currentPagePath = pagePath;
    this.onPagePathChanged.emit(pagePath);
  }

  setDevToolVisiblity(visible: boolean) {
    this._isDevToolsVisible = visible;
    this.onDevToolVisibilityChanged.emit(visible);
  }

  initialize(
    loadedState: IAppPersistDataPageStatePartial | undefined,
    allPagePaths: string[],
  ) {
    this._allPagePaths = allPagePaths;
    const tmpPagePath = loadedState?.currentPagePath;
    const initialPagePath =
      (tmpPagePath && allPagePaths.includes(tmpPagePath) && tmpPagePath) || '/';
    const initialDevToolsVisible = loadedState?.isDevToolsVisible || false;
    this._currentPagePath = initialPagePath;
    this._isDevToolsVisible = initialDevToolsVisible;
  }

  terminate(): IAppPersistDataPageStatePartial {
    const { currentPagePath, isDevToolsVisible } = this;
    return { currentPagePath, isDevToolsVisible };
  }
}
