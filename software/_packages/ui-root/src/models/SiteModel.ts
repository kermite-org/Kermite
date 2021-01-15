import { IAppWindowEvent } from '@shared';
import { ipcAgent } from '@ui-common';

export class SiteModel {
  private _isWindowActive: boolean = true;

  get isWindowActive() {
    return this._isWindowActive;
  }

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
