import { IAppWindowEvent } from '@kermite/shared';
import { appUi } from '@kermite/ui';

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

  private unsubscribe: (() => void) | undefined;

  initialize() {
    this.unsubscribe = appUi.backendAgent.subscribe(
      'appWindowEvents',
      this.onAppWindowEvents,
    );
  }

  finalize() {
    this.unsubscribe?.();
  }
}
