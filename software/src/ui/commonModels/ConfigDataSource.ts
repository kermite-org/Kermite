import { ipcAgent } from '~/ui/base';
import { useFetcher } from '~/ui/helpers';

export function useApplicationVersionText(): string {
  const appVersionInfo = useFetcher(
    ipcAgent.async.system_getApplicationVersionInfo,
    { version: '' },
  );
  return appVersionInfo.version;
}
