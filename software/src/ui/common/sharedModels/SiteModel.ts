import { IAppWindowStatus } from '~/shared';
import { ipcAgent } from '~/ui/common/base';

export class SiteModel {
  isWindowActive: boolean = true;
  isDevtoolsVisible: boolean = false;
  isWindowMaximized: boolean = false;

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
  };

  setupLifecycle = () => {
    return ipcAgent.events.window_appWindowStatus.subscribe(
      this.onAppWindowStatusEvent,
    );
  };
}
export const siteModel = new SiteModel();
