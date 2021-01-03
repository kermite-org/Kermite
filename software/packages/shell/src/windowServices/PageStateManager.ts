import { applicationStorage } from '~/base/ApplicationStorage';
import { appConfig } from '~/base/appConfig';
import { makeListnerPort } from '~/funcs';
import { enumeratePagePaths } from '~/modules';
import { IPageStateManager } from '~/windowServices/serviceInterfaces';

export class PageStateManager implements IPageStateManager {
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

  initialize() {
    this._allPagePaths = enumeratePagePaths(appConfig.publicRootPath);
    const loadedState = applicationStorage.getItem('pageState');
    const tmpPagePath = loadedState.currentPagePath;
    this._currentPagePath =
      (tmpPagePath && this.allPagePaths.includes(tmpPagePath) && tmpPagePath) ||
      '/';
    this._isDevToolsVisible = loadedState.isDevToolsVisible || false;
  }

  terminate() {
    const { currentPagePath, isDevToolsVisible } = this;
    applicationStorage.setItem('pageState', {
      currentPagePath,
      isDevToolsVisible,
    });
  }
}
