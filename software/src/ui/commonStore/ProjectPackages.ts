import produce from 'immer';
import { useMemo } from 'qx';
import {
  fallbackProjectPackageInfo,
  ICustomFirmwareEntry,
  IProjectFirmwareEntry,
  IProjectLayoutEntry,
  IProjectPackageInfo,
  IProjectPresetEntry,
  IResourceOrigin,
  IStandardFirmwareEntry,
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
  getEditTargetFirmwareEntry<K extends 'standard' | 'custom'>(
    type: K,
    resourceId: string,
  ):
    | (K extends 'standard' ? IStandardFirmwareEntry : ICustomFirmwareEntry)
    | undefined {
    const projectInfo = uiReaders.editTargetProject;
    const entry = projectInfo?.firmwares.find(
      (it) => it.resourceId === resourceId,
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

function patchLocalProjectResourceItem<
  K extends 'presets' | 'layouts' | 'firmwares',
>(target: K, entry: IProjectPackageInfo[K][0]) {
  patchLocalEditProject((draft) => {
    const resourceItems = draft[target];
    const index = resourceItems.findIndex(
      (it) => it.resourceId === entry.resourceId,
    );
    if (index >= 0) {
      resourceItems.splice(index, 1, entry as any);
    } else {
      resourceItems.push(entry as any);
    }
  });
}

function removeProjectResourceItemWithId<T extends { resourceId: string }>(
  items: T[],
  resourceId: string,
) {
  const index = items.findIndex((it) => it.resourceId === resourceId);
  if (index >= 0) {
    items.splice(index, 1);
  }
}

export const projectPackagesWriter = {
  saveLocalProject(projectInfo: IProjectPackageInfo) {
    dispatchCoreAction({
      project_saveLocalProjectPackageInfo: projectInfo,
    });
  },
  saveLocalProjectPreset(entry: IProjectPresetEntry) {
    patchLocalProjectResourceItem('presets', entry);
  },
  saveLocalProjectLayout(entry: IProjectLayoutEntry) {
    patchLocalProjectResourceItem('layouts', entry);
  },
  saveLocalProjectFirmware(entry: IProjectFirmwareEntry) {
    patchLocalProjectResourceItem('firmwares', entry);
  },
  deleteProjectResourceItem(resourceId: string) {
    patchLocalEditProject((draft) => {
      removeProjectResourceItemWithId(draft.presets, resourceId);
      removeProjectResourceItemWithId(draft.layouts, resourceId);
      removeProjectResourceItemWithId(draft.firmwares, resourceId);
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
