import {
  IProjectPackageInfo,
  IProjectResourceInfo,
  IResourceOrigin,
} from '~/shared';
import { ipcAgent } from '~/ui/base';
import { globalSettingsModel } from '~/ui/commonModels/GlobalSettingsModel';
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

export const projectPackagesReader = {
  getProjectInfosGlobalProjectSelectionAffected(): IProjectPackageInfo[] {
    const {
      useLocalResouces,
      globalProjectId,
    } = globalSettingsModel.globalSettings;

    return uiGlobalStore.allProjectPackageInfos
      .filter((info) => useLocalResouces || info.origin === 'online')
      .filter(
        (info) => globalProjectId === '' || info.projectId === globalProjectId,
      );
  },
  getEditTargetProject(): IProjectPackageInfo | undefined {
    const { globalProjectId } = globalSettingsModel.globalSettings;
    return uiGlobalStore.allProjectPackageInfos.find(
      (info) => info.origin === 'local' && info.projectId === globalProjectId,
    );
  },
};
