import { IResourceOrigin } from '~/shared';
import { ipcAgent, useFetcher } from '~/ui/common';
import { appUi } from '~/ui/common/base';

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
