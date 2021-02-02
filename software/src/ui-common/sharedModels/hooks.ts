import { IResourceOrigin } from '~/shared';
import { ipcAgent, useFetcher } from '~/ui-common';

export function useProjectResourceOriginsChecker(
  origin: IResourceOrigin,
): boolean {
  const resourceInfos = useFetcher(
    ipcAgent.async.projects_getAllProjectResourceInfos,
    [],
  );
  return resourceInfos.some((info) => info.origin === origin);
}
