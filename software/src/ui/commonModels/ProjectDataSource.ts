import {
  IProjectPackageInfo,
  IProjectResourceInfo,
  IResourceOrigin,
} from '~/shared';
import { ipcAgent } from '~/ui/base';
import { uiGlobalStore } from '~/ui/commonModels/UiGlobalStore';

export async function fetchAllProjectResourceInfos(): Promise<
  IProjectResourceInfo[]
> {
  return await ipcAgent.async.projects_getAllProjectResourceInfos();
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
