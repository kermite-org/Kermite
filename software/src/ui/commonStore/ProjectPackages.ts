import produce from 'immer';
import { useMemo } from 'qx';
import {
  fallbackProjectPackageInfo,
  IKermiteStandardKeyboardSpec,
  IPersistKeyboardDesign,
  IPersistProfileData,
  IProjectPackageInfo,
  IResourceOrigin,
} from '~/shared';
import { uiReaders } from '~/ui/commonStore/UiReaders';
import { dispatchCoreAction, uiState } from '~/ui/commonStore/base';
import { getNextFirmwareId } from '~/ui/features/LayoutEditor/models/DomainRelatedHelpers';

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

function patchLocalEditProject(
  produceFn: (draft: IProjectPackageInfo) => void,
) {
  const projectInfo = projectPackagesReader.getEditTargetProject();
  if (!projectInfo) {
    return;
  }
  const newProjectInfo = produce(projectInfo, produceFn);
  projectPackagesWriter.saveLocalProject(newProjectInfo);
}

export const projectPackagesWriter = {
  saveLocalProject(projectInfo: IProjectPackageInfo) {
    dispatchCoreAction({
      project_saveLocalProjectPackageInfo: projectInfo,
    });
  },
  saveLocalProjectLayout(layoutName: string, design: IPersistKeyboardDesign) {
    patchLocalEditProject((draft) => {
      const layout = draft.layouts.find((la) => la.layoutName === layoutName);
      if (layout) {
        layout.data = design;
      } else {
        draft.layouts.push({ layoutName, data: design });
      }
    });
  },
  saveLocalProjectPreset(presetName: string, preset: IPersistProfileData) {
    patchLocalEditProject((draft) => {
      const profile = draft.presets.find((la) => la.presetName === presetName);
      if (profile) {
        profile.data = preset;
      } else {
        draft.presets.push({ presetName, data: preset });
      }
    });
  },
  saveLocalProjectStandardFirmware(
    variationName: string,
    config: IKermiteStandardKeyboardSpec,
  ) {
    patchLocalEditProject((draft) => {
      const firmware = draft.firmwares.find(
        (it) => it.variationName === variationName,
      );
      if (firmware) {
        if (firmware.type === 'standard') {
          firmware.standardFirmwareConfig = config;
        }
      } else {
        const existingIds = draft.firmwares.map((it) => it.variationId);
        const newVariationId = getNextFirmwareId(existingIds);
        draft.firmwares.push({
          type: 'standard',
          variationName,
          variationId: newVariationId,
          standardFirmwareConfig: config,
        });
      }
    });
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
