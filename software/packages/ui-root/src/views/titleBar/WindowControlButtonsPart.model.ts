import { appUi } from '@kermite/ui';

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
      appUi.backendAgent.async.widgetModeChanged(true);
      appUi.navigateTo('./widget/index.html');
    },
    onMinimizeButton() {
      appUi.backendAgent.async.minimizeWindow();
    },
    onMaximizeButton() {
      appUi.backendAgent.async.maximizeWindow();
    },
    onCloseButton() {
      appUi.backendAgent.async.closeWindow();
    },
  };
}
