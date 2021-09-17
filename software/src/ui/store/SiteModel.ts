import { dispatchCoreAction, uiState } from '~/ui/store/base';

export const siteModel = {
  get isWindowActive() {
    return uiState.core.appWindowStatus.isActive;
  },
  get isDevtoolsVisible() {
    return uiState.core.appWindowStatus.isDevtoolsVisible;
  },
  get isWindowMaximized() {
    return uiState.core.appWindowStatus.isMaximized;
  },
  get isWidgetAlwaysOnTop() {
    return uiState.core.appWindowStatus.isWidgetAlwaysOnTop;
  },
  toggleDevToolVisible() {
    const curr = siteModel.isDevtoolsVisible;
    dispatchCoreAction({
      window_setDevToolVisibility: !curr,
    });
  },
};
