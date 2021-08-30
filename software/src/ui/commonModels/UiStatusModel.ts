import { copyObjectProps } from '~/shared';
import {
  commitUiState,
  commitUiSettings,
  uiState,
} from '~/ui/commonStore/base';

export const uiStatusModel = {
  initialize() {
    const settingsText = localStorage.getItem('uiSettings');
    if (settingsText) {
      const obj = JSON.parse(settingsText);
      const settings = { ...uiState.settings };
      copyObjectProps(settings, obj);
      commitUiSettings(settings);
    }
  },
  finalize() {
    const settingsText = JSON.stringify(uiState.settings);
    localStorage.setItem('uiSettings', settingsText);
  },
  stopLiveMode() {
    commitUiSettings({ showLayersDynamic: false });
  },
  setLoading() {
    commitUiState({ isLoading: true });
  },
  clearLoading() {
    commitUiState({ isLoading: false });
  },
};

export const onboardingPanelDisplayStateModel = {
  get isPanelVisible() {
    return uiState.settings.showOnboardingPanel;
  },
  open() {
    commitUiSettings({ showOnboardingPanel: true });
  },
  close() {
    commitUiSettings({ showOnboardingPanel: false });
  },
  toggleOnboardingPanel() {
    const showOnboardingPanel = !uiState.settings.showOnboardingPanel;
    commitUiSettings({ showOnboardingPanel });
  },
};
