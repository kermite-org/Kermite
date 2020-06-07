import { sendIpcPacketSync, backendAgent } from './dataSource/ipc';
import { IAppWindowEvent } from '~defs/ipc';
import { appUi } from './appGlobal';

export class SiteModel {
  private _isWidgetMode: boolean = false;
  private _isWindowActive: boolean = true;
  private _isDevelopment: boolean = false;

  get isWidgetMode() {
    return this._isWidgetMode;
  }

  get isWindowActive() {
    return this._isWindowActive;
  }

  get isDevelopment() {
    return this._isDevelopment;
  }

  setWidgetMode = (isWidgetMode: boolean) => {
    this._isWidgetMode = isWidgetMode;
    backendAgent.widgetModeChanged(isWidgetMode);
  };

  private onAppWindowEvents = (ev: IAppWindowEvent) => {
    if (ev.activeChanged !== undefined) {
      this._isWindowActive = ev.activeChanged;
      appUi.rerender();
    }
  };

  private async loadEnvironmenConfig() {
    const env = await backendAgent.getEnvironmentConfig();
    this._isDevelopment = env.isDevelopment;
    appUi.rerender();
  }

  initialize() {
    backendAgent.appWindowEvents.subscribe(this.onAppWindowEvents);
    this.loadEnvironmenConfig();
  }

  finalize() {
    backendAgent.appWindowEvents.unsubscribe(this.onAppWindowEvents);
  }
}
