import { useMemo } from 'qx';
import { IProjectResourceInfo, IResourceOrigin } from '~/shared';
import { ipcAgent } from '~/ui/base';
import { useFetcher } from '~/ui/helpers';

export async function fetchAllProjectResourceInfos(): Promise<
  IProjectResourceInfo[]
> {
  return await ipcAgent.async.projects_getAllProjectResourceInfos();
}

export function useAllProjectResourceInfos(): IProjectResourceInfo[] {
  return useFetcher(ipcAgent.async.projects_getAllProjectResourceInfos, []);
}

export function useProjectResourceInfos() {
  return useAllProjectResourceInfos();
}

export function useLocalProjectResourceInfos(): IProjectResourceInfo[] {
  const allResourceInfos = useAllProjectResourceInfos();
  return useMemo(
    () => allResourceInfos.filter((info) => info.origin === 'local'),
    [allResourceInfos],
  );
}

export function useProjectInfo(
  origin?: IResourceOrigin,
  projectId?: string,
): IProjectResourceInfo | undefined {
  const resourceInfos = useAllProjectResourceInfos();
  return (
    resourceInfos.find(
      (info) => info.origin === origin && info.projectId === projectId,
    ) || resourceInfos.find((info) => info.projectId === projectId)
  );
}
