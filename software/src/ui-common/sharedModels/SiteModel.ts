import { IAppWindowStatus } from '~/shared';
import { ipcAgent } from '~/ui-common';

export class SiteModel {
  isWidgetMode: boolean = false;
  isWindowActive: boolean = true;
  isDevtoolsVisible: boolean = false;
  isWindowMaximized: boolean = false;

  setWidgetMode = (isWidgetMode: boolean) => {
    this.isWidgetMode = isWidgetMode;
    // backendAgent.widgetModeChanged(isWidgetMode);
  };

  toggleDevToolVisible = () => {
    ipcAgent.async.window_setDevToolVisibility(!this.isDevtoolsVisible);
  };

  private onAppWindowStatusEvent = (ev: Partial<IAppWindowStatus>) => {
    if (ev.isActive !== undefined) {
      this.isWindowActive = ev.isActive;
    } else if (ev.isDevtoolsVisible !== undefined) {
      this.isDevtoolsVisible = ev.isDevtoolsVisible;
    } else if (ev.isMaximized !== undefined) {
      this.isWindowMaximized = ev.isMaximized;
    }
  };

  setupLifecycle = () => {
    return ipcAgent.subscribe(
      'window_appWindowStatus',
      this.onAppWindowStatusEvent,
    );
  };
}
export const siteModel = new SiteModel();
