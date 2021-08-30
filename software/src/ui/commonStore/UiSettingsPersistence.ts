import { copyObjectProps } from '~/shared';
import { commitUiSettings, uiState } from '~/ui/commonStore/base';

export const uiSettingsPersistence = {
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
};
