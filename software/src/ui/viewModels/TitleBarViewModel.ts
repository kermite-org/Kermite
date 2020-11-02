import { appUi } from '~ui/core';
import { Models } from '~ui/models';

export class TitleBarViewModel {
  showReloadButton = appUi.isDevelopment;

  constructor(private models: Models) {}

  onReloadButton = () => {
    this.models.backend.reloadApplication();
  };

  onWidgetButton = () => {
    this.models.siteModel.setWidgetMode(true);
  };

  onMinimizeButton = () => {
    this.models.backend.minimizeWindow();
  };

  onMaximizeButton = () => {
    this.models.backend.maximizeWindow();
  };

  onCloseButton = () => {
    this.models.backend.closeWindow();
  };
}
