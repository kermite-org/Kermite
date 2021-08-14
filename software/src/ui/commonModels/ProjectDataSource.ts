import produce from 'immer';
import { useMemo } from 'qx';
import {
  fallbackProjectPackageInfo,
  IPersistKeyboardDesign,
  IPersistProfileData,
  IProjectPackageInfo,
  IResourceOrigin,
} from '~/shared';
import { ipcAgent } from '~/ui/base';
import { globalSettingsModel } from '~/ui/commonModels/GlobalSettingsModel';
import { uiState, uiStateReader } from '~/ui/commonModels/UiState';

export const projectPackagesReader = {
  getProjectInfosGlobalProjectSelectionAffected(): IProjectPackageInfo[] {
    const {
      useLocalResouces,
      globalProjectId,
    } = globalSettingsModel.globalSettings;

    return uiStateReader.allProjectPackageInfos
      .filter((info) => useLocalResouces || info.origin === 'online')
      .filter(
        (info) => globalProjectId === '' || info.projectId === globalProjectId,
      );
  },
  getEditTargetProject(): IProjectPackageInfo | undefined {
    const { globalProjectId } = globalSettingsModel.globalSettings;
    return uiStateReader.allProjectPackageInfos.find(
      (info) => info.origin === 'local' && info.projectId === globalProjectId,
    );
  },
  findProjectInfo(
    origin?: IResourceOrigin,
    projectId?: string,
  ): IProjectPackageInfo | undefined {
    const resourceInfos = uiStateReader.allProjectPackageInfos;
    return (
      resourceInfos.find(
        (info) => info.origin === origin && info.projectId === projectId,
      ) || resourceInfos.find((info) => info.projectId === projectId)
    );
  },
};

export const projectPackagesMutations = {
  saveLocalProject(projectInfo: IProjectPackageInfo) {
    const index = uiStateReader.allProjectPackageInfos.findIndex(
      (info) => info.sig === projectInfo.sig,
    );
    if (index === -1) {
      return;
    }
    uiState.core.allProjectPackageInfos = produce(
      uiStateReader.allProjectPackageInfos,
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
      const profile = draft.presets.find((la) => la.presetName === presetName);
      if (profile) {
        profile.data = preset;
      } else {
        draft.presets.push({ presetName: presetName, data: preset });
      }
    });
    projectPackagesMutations.saveLocalProject(newProjectInfo);
  },
};

export const projectPackagesHooks = {
  useEditTargetProject(): IProjectPackageInfo {
    return (
      useMemo(projectPackagesReader.getEditTargetProject, [
        uiStateReader.allProjectPackageInfos,
      ]) || fallbackProjectPackageInfo
    );
  },
};
