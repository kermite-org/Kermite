import { appUi, ipcAgent } from '~/ui-common';

export interface ITitleBarViewModel {
  // showReloadButton: boolean;
  // onReloadButton(): void;
  onWidgetButton(): void;
  onMinimizeButton(): void;
  onMaximizeButton(): void;
  onCloseButton(): void;
}

export function makeWindowControlButtonsModel(): ITitleBarViewModel {
  return {
    // showReloadButton: appUi.isDevelopment,
    // showReloadButton: false,
    // onReloadButton() {
    //   appUi.backendAgent.async.reloadApplication();
    // },
    onWidgetButton() {
      // appUi.backendAgent.async.window_widgetModeChanged(true);
      appUi.navigateTo('./widget/index.html');
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
