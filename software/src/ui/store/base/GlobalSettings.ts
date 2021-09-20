import { IGlobalSettings } from '~/shared';
import { dispatchCoreAction } from '~/ui/store/base/UiState';

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
