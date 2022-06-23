import { copyObjectProps } from '~/shared';
import {
  commitUiSettings,
  commitUiState,
  uiState,
} from '~/ui/store/base/uiState';

export const uiSettingsPersistence = {
  initialize() {
    const settingsText = localStorage.getItem('uiSettings');
    if (settingsText) {
      const obj = JSON.parse(settingsText);
      const settings = { ...uiState.settings };
      copyObjectProps(settings, obj);
      commitUiSettings(settings);
    }

    const pageSpecText = sessionStorage.getItem('pageSpec');
    if (pageSpecText && pageSpecText !== 'undefined') {
      const pageSpec = JSON.parse(pageSpecText);
      commitUiState({ pageSpec });
    }
  },
  finalize() {
    const settingsText = JSON.stringify(uiState.settings);
    localStorage.setItem('uiSettings', settingsText);

    const pageSpecText = JSON.stringify(uiState.pageSpec);
    sessionStorage.setItem('pageSpec', pageSpecText);
  },
};
