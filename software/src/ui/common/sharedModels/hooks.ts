import { IResourceOrigin } from '~/shared';
import { ipcAgent, appUi } from '~/ui/common/base';
import { useFetcher } from '~/ui/common/helpers';

export function useProjectResourcePresenceChecker(
  origin: IResourceOrigin,
): boolean {
  if (!appUi.isExecutedInApp) {
    return false;
  }

  const resourceInfos = useFetcher(
    ipcAgent.async.projects_getAllProjectResourceInfos,
    [],
  );
  return resourceInfos.some((info) => info.origin === origin);
}
