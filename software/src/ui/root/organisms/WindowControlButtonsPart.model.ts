import { router } from '~/ui/base';
import { siteModel } from '~/ui/commonModels';
import { dispatchCoreAction } from '~/ui/commonStore';

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
      dispatchCoreAction({ window_restartApplication: 1 });
    },
    onWidgetButton() {
      router.navigateTo('/widget');
    },
    onMinimizeButton() {
      dispatchCoreAction({ window_minimizeWindow: 1 });
    },
    onMaximizeButton() {
      dispatchCoreAction({ window_maximizeWindow: 1 });
    },
    onCloseButton() {
      dispatchCoreAction({ window_closeWindow: 1 });
    },
    isWindowMaximized: siteModel.isWindowMaximized,
  };
}
