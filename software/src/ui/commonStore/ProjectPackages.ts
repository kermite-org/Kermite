import produce from 'immer';
import { useMemo } from 'qx';
import {
  fallbackProjectPackageInfo,
  ICustomFirmwareEntry,
  IKermiteStandardKeyboardSpec,
  IPersistKeyboardDesign,
  IPersistProfileData,
  IProjectFirmwareEntry,
  IProjectPackageInfo,
  IResourceOrigin,
  IStandardFirmwareEntry,
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
  getEditTargetFirmwareEntry<K extends 'standard' | 'custom'>(
    type: K,
    variationId: string,
  ):
    | (K extends 'standard' ? IStandardFirmwareEntry : ICustomFirmwareEntry)
    | undefined {
    const projectInfo = uiReaders.editTargetProject;
    const entry = projectInfo?.firmwares.find(
      (it) => it.variationId === variationId,
    );
    if (entry?.type === type) {
      return entry as any;
    }
    return undefined;
  },
  getEditTargetFirmwareEntryByVariationName_deprecated<
    K extends 'standard' | 'custom',
  >(
    type: K,
    variationName: string,
  ):
    | (K extends 'standard' ? IStandardFirmwareEntry : ICustomFirmwareEntry)
    | undefined {
    const projectInfo = uiReaders.editTargetProject;
    const entry = projectInfo?.firmwares.find(
      (it) => it.variationName === variationName,
    );
    if (entry?.type === type) {
      return entry as any;
    }
    return undefined;
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
  saveLocalProjectFirmware(variationId: string, entry: IProjectFirmwareEntry) {
    patchLocalEditProject((draft) => {
      const index = draft.firmwares.findIndex(
        (it) => it.variationId === variationId,
      );
      if (index >= 0) {
        draft.firmwares.splice(index, 1, entry);
      } else {
        draft.firmwares.push(entry);
      }
    });
  },
  saveLocalProjectStandardFirmware_deprecated(
    variationId: string,
    variationName: string,
    config: IKermiteStandardKeyboardSpec,
  ) {
    patchLocalEditProject((draft) => {
      const firmware = draft.firmwares.find(
        (it) => it.variationId === variationId,
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
