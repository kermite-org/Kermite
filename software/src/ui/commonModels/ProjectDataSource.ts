import { useMemo } from 'qx';
import {
  IProjectPackageInfo,
  IProjectResourceInfo,
  IResourceOrigin,
} from '~/shared';
import { ipcAgent } from '~/ui/base';
import { uiGlobalStore } from '~/ui/commonModels/UiGlobalStore';
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

export function useLocalProjectResourceInfos(): IProjectPackageInfo[] {
  const allResourceInfos = uiGlobalStore.allProjectPackageInfos;
  return useMemo(
    () => allResourceInfos.filter((info) => info.origin === 'local'),
    [allResourceInfos],
  );
}

export function useProjectInfo(
  origin?: IResourceOrigin,
  projectId?: string,
): IProjectPackageInfo | undefined {
  const resourceInfos = uiGlobalStore.allProjectPackageInfos;
  return (
    resourceInfos.find(
      (info) => info.origin === origin && info.projectId === projectId,
    ) || resourceInfos.find((info) => info.projectId === projectId)
  );
}
