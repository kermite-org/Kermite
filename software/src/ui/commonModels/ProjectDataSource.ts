import produce from 'immer';
import { useMemo } from 'qx';
import {
  fallbackProjectPackageInfo,
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

export const projectPackagesMutations = {
  saveLocalProjectPackageData(projectInfo: IProjectPackageInfo) {
    const index = uiGlobalStore.allProjectPackageInfos.findIndex(
      (info) => info.sig === projectInfo.sig,
    );
    if (index !== -1) {
      uiGlobalStore.allProjectPackageInfos = produce(
        uiGlobalStore.allProjectPackageInfos,
        (draft) => {
          draft.splice(index, 1, projectInfo);
        },
      );
    }
  },
};

export const projectPackagesHooks = {
  useEditTargetProject(): IProjectPackageInfo {
    return (
      useMemo(projectPackagesReader.getEditTargetProject, [
        uiGlobalStore.allProjectPackageInfos,
      ]) || fallbackProjectPackageInfo
    );
  },
};
