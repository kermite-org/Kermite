import { IAppWindowStatus } from '~/shared';
import { ipcAgent } from '~/ui-common';

export class SiteModel {
  isWidgetMode: boolean = false;
  isWindowActive: boolean = true;
  isDevtoolsVisible: boolean = false;
  isWindowMaximized: boolean = false;

  setWidgetMode = (isWidgetMode: boolean) => {
    ipcAgent.async.window_setWidgetMode(isWidgetMode);
  };

  toggleDevToolVisible = () => {
    ipcAgent.async.window_setDevToolVisibility(!this.isDevtoolsVisible);
  };

  private onAppWindowStatusEvent = (ev: Partial<IAppWindowStatus>) => {
    if (ev.isActive !== undefined) {
      this.isWindowActive = ev.isActive;
    }
    if (ev.isDevtoolsVisible !== undefined) {
      this.isDevtoolsVisible = ev.isDevtoolsVisible;
    }
    if (ev.isMaximized !== undefined) {
      this.isWindowMaximized = ev.isMaximized;
    }
    if (ev.isWidgetMode !== undefined) {
      this.isWidgetMode = ev.isWidgetMode;
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
