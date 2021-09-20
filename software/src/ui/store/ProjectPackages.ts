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
import { uiReaders, dispatchCoreAction, uiState } from '~/ui/store/base';

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
  getEditTargetFirmwareEntryByFirmwareName<K extends 'standard' | 'custom'>(
    type: K,
    firmwareName: string,
  ):
    | (K extends 'standard' ? IStandardFirmwareEntry : ICustomFirmwareEntry)
    | undefined {
    const projectInfo = uiReaders.editTargetProject;
    const entry = projectInfo?.firmwares.find(
      (it) => it.firmwareName === firmwareName,
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

function insertItemToArray<T, K extends keyof T>(
  items: T[],
  keyPropName: K,
  newItem: T,
) {
  const index = items.findIndex(
    (it) => it[keyPropName] === newItem[keyPropName],
  );
  if (index >= 0) {
    items.splice(index, 1, newItem);
  } else {
    items.push(newItem);
  }
}

function removeItemFromArray<T, K extends keyof T>(
  items: T[],
  keyPropName: K,
  key: Extract<T[K], string>,
) {
  const index = items.findIndex((it) => it[keyPropName] === key);
  if (index >= 0) {
    items.splice(index, 1);
  }
}

function renameItemInArray<T, K extends keyof T>(
  items: T[],
  nameFiled: K,
  oldName: Extract<T[K], string>,
  newName: Extract<T[K], string>,
) {
  const item = items.find((it) => it[nameFiled] === oldName);
  if (item) {
    item[nameFiled] = newName;
  }
}

function copyItemInArray<T, K extends keyof T>(
  items: T[],
  nameFiled: K,
  srcName: Extract<T[K], string>,
  newName: Extract<T[K], string>,
) {
  const index = items.findIndex((it) => it[nameFiled] === srcName);
  if (index >= 0) {
    const item = items[index];
    const copied = { ...item, [nameFiled]: newName };
    items.splice(index + 1, 0, copied);
  }
}

export const projectPackagesWriter = {
  saveLocalProject(projectInfo: IProjectPackageInfo) {
    dispatchCoreAction({
      project_saveLocalProjectPackageInfo: projectInfo,
    });
  },
  saveLocalProjectPreset(item: IProjectPresetEntry) {
    patchLocalEditProject((draft) =>
      insertItemToArray(draft.presets, 'presetName', item),
    );
  },
  saveLocalProjectLayout(item: IProjectLayoutEntry) {
    patchLocalEditProject((draft) =>
      insertItemToArray(draft.layouts, 'layoutName', item),
    );
  },
  saveLocalProjectFirmware(item: IProjectFirmwareEntry) {
    patchLocalEditProject((draft) =>
      insertItemToArray(draft.firmwares, 'firmwareName', item),
    );
  },
  deleteLocalProjectPreset(presetName: string) {
    patchLocalEditProject((draft) =>
      removeItemFromArray(draft.presets, 'presetName', presetName),
    );
  },
  deleteLocalProjectLayout(layoutName: string) {
    patchLocalEditProject((draft) =>
      removeItemFromArray(draft.layouts, 'layoutName', layoutName),
    );
  },
  deleteLocalProjectFirmware(firmwareName: string) {
    patchLocalEditProject((draft) =>
      removeItemFromArray(draft.firmwares, 'firmwareName', firmwareName),
    );
  },
  renameLocalProjectPreset(oldName: string, newName: string) {
    patchLocalEditProject((draft) => {
      renameItemInArray(draft.presets, 'presetName', oldName, newName);
    });
  },
  renameLocalProjectLayout(oldName: string, newName: string) {
    patchLocalEditProject((draft) => {
      renameItemInArray(draft.layouts, 'layoutName', oldName, newName);
    });
  },
  renameLocalProjectFirmware(oldName: string, newName: string) {
    patchLocalEditProject((draft) => {
      renameItemInArray(draft.firmwares, 'firmwareName', oldName, newName);
    });
  },
  copyLocalProjectPreset(srcName: string, newName: string) {
    patchLocalEditProject((draft) => {
      copyItemInArray(draft.presets, 'presetName', srcName, newName);
    });
  },
  copyLocalProjectLayout(srcName: string, newName: string) {
    patchLocalEditProject((draft) => {
      copyItemInArray(draft.layouts, 'layoutName', srcName, newName);
    });
  },
  copyLocalProjectFirmware(srcName: string, newName: string) {
    patchLocalEditProject((draft) => {
      copyItemInArray(draft.firmwares, 'firmwareName', srcName, newName);
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
