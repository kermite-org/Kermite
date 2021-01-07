import { appUi, backendAgent } from '~ui/core';
import { models } from '~ui/models';

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
      backendAgent.reloadApplication();
    },
    onWidgetButton() {
      models.siteModel.setWidgetMode(true);
    },
    onMinimizeButton() {
      backendAgent.minimizeWindow();
    },
    onMaximizeButton() {
      backendAgent.maximizeWindow();
    },
    onCloseButton() {
      backendAgent.closeWindow();
    }
  };
}
