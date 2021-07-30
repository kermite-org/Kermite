import { globalSettingsFallbackValue } from '~/shared';
import { ipcAgent } from '~/ui/base';
import { useFetcher } from '~/ui/helpers';

export function useGlobalSettingsFetch() {
  return useFetcher(
    ipcAgent.async.config_getGlobalSettings,
    globalSettingsFallbackValue,
  );
}
