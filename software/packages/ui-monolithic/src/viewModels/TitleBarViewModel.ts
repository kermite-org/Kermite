import { appUi, ipcAgent } from '@kermite/ui';
import { models } from '~/models';

export interface ITitleBarViewModel {
  showReloadButton: boolean;
  onReloadButton(): void;
  onWidgetButton(): void;
  onMinimizeButton(): void;
  onMaximizeButton(): void;
  onCloseButton(): void;
}

export function makeTitleBarViewModel(): ITitleBarViewModel {
  return {
    showReloadButton: appUi.isDevelopment,
    onReloadButton() {
      // ipcAgent.async.window_reloadApplication();
    },
    onWidgetButton() {
      models.siteModel.setWidgetMode(true);
    },
    onMinimizeButton() {
      ipcAgent.async.window_minimizeWindow();
    },
    onMaximizeButton() {
      ipcAgent.async.window_maximizeWindow();
    },
    onCloseButton() {
      ipcAgent.async.window_closeWindow();
    },
  };
}
