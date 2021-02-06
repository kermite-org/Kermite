import { IAppWindowEvent } from '~/shared';
import { ipcAgent } from '~/ui-common';

export class SiteModel {
  isWidgetMode: boolean = false;
  isWindowActive: boolean = true;
  isDevToolVisible: boolean = false;
  isWindowMaximized: boolean = false;

  setWidgetMode = (isWidgetMode: boolean) => {
    this.isWidgetMode = isWidgetMode;
    // backendAgent.widgetModeChanged(isWidgetMode);
  };

  private onAppWindowEvents = (ev: IAppWindowEvent) => {
    if (ev.activeChanged !== undefined) {
      this.isWindowActive = ev.activeChanged;
    } else if (ev.devToolVisible !== undefined) {
      this.isDevToolVisible = ev.devToolVisible;
    } else if (ev.isMaximized !== undefined) {
      this.isWindowMaximized = ev.isMaximized;
    }
  };

  toggleDevToolVisible = () => {
    ipcAgent.async.window_setDevToolVisibility(!this.isDevToolVisible);
  };

  setupLifecycle = () => {
    return ipcAgent.subscribe('window_appWindowEvents', this.onAppWindowEvents);
  };
}
export const siteModel = new SiteModel();
