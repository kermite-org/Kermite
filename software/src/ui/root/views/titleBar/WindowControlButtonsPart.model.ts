import { ipcAgent, router } from '~/ui/common';
import { siteModel } from '~/ui/common/sharedModels/SiteModel';

export interface IWindowControlButtonsModel {
  showReloadButton: boolean;
  onReloadButton(): void;
  onWidgetButton(): void;
  onMinimizeButton(): void;
  onMaximizeButton(): void;
  onCloseButton(): void;
  isWindowMaximized: boolean;
}

export function makeWindowControlButtonsModel(): IWindowControlButtonsModel {
  return {
    // showReloadButton: appUi.isDevelopment,
    showReloadButton: false,
    onReloadButton() {
      ipcAgent.async.window_restartApplication();
    },
    onWidgetButton() {
      router.navigateTo('/widget');
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
    isWindowMaximized: siteModel.isWindowMaximized,
  };
}
