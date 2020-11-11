import { appUi, backendAgent } from '~ui/core';
import { models } from '~ui/models';

export function makeTitleBarViewModel() {
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
