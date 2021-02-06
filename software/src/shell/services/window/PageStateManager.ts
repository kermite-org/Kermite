import { appConfig, applicationStorage } from '~/shell/base';
import { makeListenerPort } from '~/shell/funcs';
import { IPageStateManager } from './interfaces';
import { enumeratePagePaths } from './modules';

export class PageStateManager implements IPageStateManager {
  private _allPagePaths: string[] = [];
  private _currentPagePath: string = '/';

  onPagePathChanged = makeListenerPort<string>();

  get allPagePaths() {
    return this._allPagePaths;
  }

  get currentPagePath() {
    return this._currentPagePath;
  }

  setCurrentPagePath(pagePath: string) {
    this._currentPagePath = pagePath;
    this.onPagePathChanged.emit(pagePath);
  }

  initialize() {
    this._allPagePaths = enumeratePagePaths(appConfig.publicRootPath);
    const loadedState = applicationStorage.getItem('pageState');
    const tmpPagePath = loadedState.currentPagePath;
    this._currentPagePath =
      (tmpPagePath && this.allPagePaths.includes(tmpPagePath) && tmpPagePath) ||
      '/';
  }

  terminate() {
    const { currentPagePath } = this;
    applicationStorage.setItem('pageState', {
      currentPagePath,
    });
  }
}
