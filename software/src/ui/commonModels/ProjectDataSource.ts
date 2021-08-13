import produce from 'immer';
import { useMemo } from 'qx';
import {
  fallbackProjectPackageInfo,
  IPersistKeyboardDesign,
  IPersistProfileData,
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
  findProjectInfo(
    origin?: IResourceOrigin,
    projectId?: string,
  ): IProjectPackageInfo | undefined {
    const resourceInfos = uiGlobalStore.allProjectPackageInfos;
    return (
      resourceInfos.find(
        (info) => info.origin === origin && info.projectId === projectId,
      ) || resourceInfos.find((info) => info.projectId === projectId)
    );
  },
};

export const projectPackagesMutations = {
  saveLocalProject(projectInfo: IProjectPackageInfo) {
    const index = uiGlobalStore.allProjectPackageInfos.findIndex(
      (info) => info.sig === projectInfo.sig,
    );
    if (index === -1) {
      return;
    }
    uiGlobalStore.allProjectPackageInfos = produce(
      uiGlobalStore.allProjectPackageInfos,
      (draft) => {
        draft.splice(index, 1, projectInfo);
      },
    );
    ipcAgent.async.projects_saveLocalProjectPackageInfo(projectInfo);
  },
  saveLocalProjectLayout(layoutName: string, design: IPersistKeyboardDesign) {
    const projectInfo = projectPackagesReader.getEditTargetProject();
    if (!projectInfo) {
      return;
    }
    const newProjectInfo = produce(projectInfo, (draft) => {
      const layout = draft.layouts.find((la) => la.layoutName === layoutName);
      if (layout) {
        layout.data = design;
      } else {
        draft.layouts.push({ layoutName, data: design });
      }
    });
    projectPackagesMutations.saveLocalProject(newProjectInfo);
  },
  saveLocalProjectPreset(presetName: string, preset: IPersistProfileData) {
    const projectInfo = projectPackagesReader.getEditTargetProject();
    if (!projectInfo) {
      return;
    }
    const newProjectInfo = produce(projectInfo, (draft) => {
      const profile = draft.profiles.find(
        (la) => la.profileName === presetName,
      );
      if (profile) {
        profile.data = preset;
      } else {
        draft.profiles.push({ profileName: presetName, data: preset });
      }
    });
    projectPackagesMutations.saveLocalProject(newProjectInfo);
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
