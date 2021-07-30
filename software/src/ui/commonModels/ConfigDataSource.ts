import { globalSettingsFallbackValue, IGlobalSettings } from '~/shared';
import { ipcAgent } from '~/ui/base';
import { useFetcher } from '~/ui/helpers';

export function useGlobalSettingsFetch() {
  return useFetcher(
    ipcAgent.async.config_getGlobalSettings,
    globalSettingsFallbackValue,
  );
}

export function useGlobalSettingsValue<K extends keyof IGlobalSettings>(
  key: K,
): IGlobalSettings[K] {
  const globalSettings = useGlobalSettingsFetch();
  return globalSettings[key];
}
