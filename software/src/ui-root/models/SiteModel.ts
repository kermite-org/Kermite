import { IAppWindowEvent } from '@kermite/shared';
import { ipcAgent } from '@kermite/ui';

export class SiteModel {
  private _isWidgetMode: boolean = false;
  private _isWindowActive: boolean = true;

  get isWidgetMode() {
    return this._isWidgetMode;
  }

  get isWindowActive() {
    return this._isWindowActive;
  }

  setWidgetMode = (isWidgetMode: boolean) => {
    this._isWidgetMode = isWidgetMode;
    // backendAgent.widgetModeChanged(isWidgetMode);
  };

  private onAppWindowEvents = (ev: IAppWindowEvent) => {
    if (ev.activeChanged !== undefined) {
      this._isWindowActive = ev.activeChanged;
    }
  };

  initialize() {
    ipcAgent.subscribe2('window_appWindowEvents', this.onAppWindowEvents);
  }

  finalize() {
    ipcAgent.unsubscribe2('window_appWindowEvents', this.onAppWindowEvents);
  }
}
