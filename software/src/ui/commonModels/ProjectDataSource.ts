import { useMemo } from 'qx';
import { IProjectResourceInfo, IResourceOrigin } from '~/shared';
import { appUi, ipcAgent } from '~/ui/base';
import { readSettingsResouceOrigin } from '~/ui/commonModels/DomainHelpers';
import { globalSettingsModel } from '~/ui/commonModels/GlobalSettingsModel';
import { useFetcher } from '~/ui/helpers';

export async function fetchAllProjectResourceInfos(): Promise<
  IProjectResourceInfo[]
> {
  return await ipcAgent.async.projects_getAllProjectResourceInfos();
}

export function useAllProjectResourceInfos(): IProjectResourceInfo[] {
  return useFetcher(ipcAgent.async.projects_getAllProjectResourceInfos, []);
}

export function useProjectResourcePresenceChecker(
  origin: IResourceOrigin,
): boolean {
  if (!appUi.isExecutedInApp) {
    return false;
  }
  const resourceInfos = useAllProjectResourceInfos();
  return resourceInfos.some((info) => info.origin === origin);
}

export function useProjectResourceInfos() {
  return useAllProjectResourceInfos();
}

export function useProjectResourceInfosBasedOnGlobalSettings() {
  const origin = readSettingsResouceOrigin(globalSettingsModel.globalSettings);
  const allResourceInfos = useAllProjectResourceInfos();
  return useMemo(
    () => allResourceInfos.filter((info) => info.origin === origin),
    [allResourceInfos],
  );
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

export function projectResourceInfoFilter_affectGlobalProjectSelection(
  info: IProjectResourceInfo,
): boolean {
  const { globalProjectId } = globalSettingsModel.globalSettings;
  return globalProjectId === '' || info.projectId === globalProjectId;
}

export function useProjectResourceInfosFilteredByGlobalProjectSelection() {
  const {
    useLocalResouces,
    globalProjectId,
  } = globalSettingsModel.globalSettings;
  const allResourceInfos = useAllProjectResourceInfos();
  return useMemo(
    () =>
      allResourceInfos
        .filter((info) => useLocalResouces || info.origin === 'online')
        .filter(
          (info) => !globalProjectId || info.projectId === globalProjectId,
        ),
    [allResourceInfos],
  );
}
