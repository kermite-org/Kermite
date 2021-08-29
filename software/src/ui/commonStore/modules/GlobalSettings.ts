import { IGlobalSettings } from '~/shared';
import { uiState, dispatchCoreAction } from '~/ui/commonStore/base';

export const globalSettingsReader = {
  get globalSettings() {
    return uiState.core.globalSettings;
  },
  get isLocalProjectSelectedForEdit(): boolean {
    const { developerMode, globalProjectSpec } = uiState.core.globalSettings;
    return developerMode && globalProjectSpec?.origin === 'local';
  },
  get isDeveloperMode() {
    return this.globalSettings.developerMode;
  },
};

export const globalSettingsWriter = {
  writeValue<K extends keyof IGlobalSettings>(
    key: K,
    value: IGlobalSettings[K],
  ) {
    dispatchCoreAction({
      config_writeGlobalSettings: { [key]: value },
    });
  },
};
