import { IAppWindowEvent } from '~/shared';
import { ipcAgent } from '~/ui-common';

export class SiteModel {
  private _isWidgetMode: boolean = false;
  private _isWindowActive: boolean = true;
  private _isDevToolVisible: boolean = false;

  get isWidgetMode() {
    return this._isWidgetMode;
  }

  get isWindowActive() {
    return this._isWindowActive;
  }

  get isDevToolVisible() {
    return this._isDevToolVisible;
  }

  setWidgetMode = (isWidgetMode: boolean) => {
    this._isWidgetMode = isWidgetMode;
    // backendAgent.widgetModeChanged(isWidgetMode);
  };

  private onAppWindowEvents = (ev: IAppWindowEvent) => {
    if (ev.activeChanged !== undefined) {
      this._isWindowActive = ev.activeChanged;
    } else if (ev.devToolVisible !== undefined) {
      this._isDevToolVisible = ev.devToolVisible;
    }
  };

  toggleDevToolVisible = () => {
    ipcAgent.async.window_setDevToolVisibility(!this._isDevToolVisible);
  };

  initialize() {
    ipcAgent.subscribe2('window_appWindowEvents', this.onAppWindowEvents);
  }

  finalize() {
    ipcAgent.unsubscribe2('window_appWindowEvents', this.onAppWindowEvents);
  }
}
export const siteModel = new SiteModel();
