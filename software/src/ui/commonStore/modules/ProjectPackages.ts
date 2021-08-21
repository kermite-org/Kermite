import produce from 'immer';
import { useMemo } from 'qx';
import {
  fallbackProjectPackageInfo,
  IPersistKeyboardDesign,
  IPersistProfileData,
  IProjectPackageInfo,
  IResourceOrigin,
} from '~/shared';
import {
  uiStateReader,
  dispatchCoreAction,
  uiState,
} from '~/ui/commonStore/base';

export const projectPackagesReader = {
  getProjectInfosGlobalProjectSelectionAffected(): IProjectPackageInfo[] {
    const { useLocalResources, globalProjectId } = uiStateReader.globalSettings;

    return uiStateReader.allProjectPackageInfos
      .filter((info) => useLocalResources || info.origin === 'online')
      .filter(
        (info) => globalProjectId === '' || info.projectId === globalProjectId,
      );
  },
  getEditTargetProject(): IProjectPackageInfo | undefined {
    const { globalProjectId } = uiStateReader.globalSettings;
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
  findFirmwareInfo(firmwareId: string | undefined) {
    return uiState.core.allCustomFirmwareInfos.find(
      (info) => info.firmwareId === firmwareId,
    );
  },
};

export const projectPackagesWriter = {
  saveLocalProject(projectInfo: IProjectPackageInfo) {
    dispatchCoreAction({
      project_saveLocalProjectPackageInfo: projectInfo,
    });
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
    projectPackagesWriter.saveLocalProject(newProjectInfo);
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
    projectPackagesWriter.saveLocalProject(newProjectInfo);
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
