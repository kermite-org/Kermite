import { globalSettingsFallbackValue, IGlobalSettings } from '~/shared';
import { ipcAgent } from '~/ui/base';
import { useFetcher } from '~/ui/helpers';

export async function fetchGlobalSettings(): Promise<IGlobalSettings> {
  return await ipcAgent.async.config_getGlobalSettings();
}

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

export function useApplicationVersionText(): string {
  const appVersionInfo = useFetcher(
    ipcAgent.async.system_getApplicationVersionInfo,
    { version: '' },
  );
  return appVersionInfo.version;
}
