import { IGlobalSettings } from '~/shared';
import { dispatchCoreAction } from '~/ui/store/base/uiState';

export const globalSettingsWriter = {
  async writeValue<K extends keyof IGlobalSettings>(
    key: K,
    value: IGlobalSettings[K],
  ) {
    await dispatchCoreAction({
      config_writeGlobalSettings: { [key]: value },
    });
  },
};
