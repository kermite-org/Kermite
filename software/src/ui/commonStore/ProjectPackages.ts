import produce from 'immer';
import { useMemo } from 'qx';
import {
  fallbackProjectPackageInfo,
  IPersistKeyboardDesign,
  IPersistProfileData,
  IProjectPackageInfo,
  IResourceOrigin,
} from '~/shared';
import { uiReaders } from '~/ui/commonStore/UiReaders';
import { dispatchCoreAction, uiState } from '~/ui/commonStore/base';

export const projectPackagesReader = {
  getProjectInfosGlobalProjectSelectionAffected(): IProjectPackageInfo[] {
    const { globalProjectSpec } = uiState.core.globalSettings;
    if (globalProjectSpec) {
      const { projectId, origin } = globalProjectSpec;
      return uiReaders.allProjectPackageInfos.filter(
        (info) =>
          info.projectId === projectId &&
          (info.origin === origin || info.origin === 'online'),
      );
    } else {
      return uiReaders.allProjectPackageInfos;
    }
  },
  getEditTargetProject(): IProjectPackageInfo | undefined {
    const { globalProjectKey } = uiReaders;
    return uiReaders.allProjectPackageInfos.find(
      (info) => info.projectKey === globalProjectKey && info.origin === 'local',
    );
  },
  findProjectInfo(
    origin?: IResourceOrigin,
    projectId?: string,
  ): IProjectPackageInfo | undefined {
    const resourceInfos = uiReaders.allProjectPackageInfos;
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
        uiReaders.allProjectPackageInfos,
      ]) || fallbackProjectPackageInfo
    );
  },
};
