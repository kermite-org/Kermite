import { useMemo } from 'alumina';
import produce from 'immer';
import {
  fallbackProjectPackageInfo,
  getOriginAndProjectIdFromProjectKey,
  ICustomFirmwareEntry,
  IProjectFirmwareEntry,
  IProjectLayoutEntry,
  IProjectPackageInfo,
  IProjectProfileEntry,
  IProjectResourceItemType,
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
  findProjectInfoByProjectKey(
    projectKey: string,
  ): IProjectPackageInfo | undefined {
    const { origin, projectId } =
      getOriginAndProjectIdFromProjectKey(projectKey);
    return projectPackagesReader.findProjectInfo(origin, projectId);
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

async function patchLocalEditProject(
  produceFn: (draft: IProjectPackageInfo) => void,
) {
  const projectInfo = projectPackagesReader.getEditTargetProject();
  if (!projectInfo) {
    return;
  }
  const newProjectInfo = produce(projectInfo, produceFn);
  await projectPackagesWriter.saveLocalProject(newProjectInfo);
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

type IResourceItemTypeMap = {
  profile: IProjectProfileEntry;
  layout: IProjectLayoutEntry;
  firmware: IProjectFirmwareEntry;
};

const fieldNamesMap = {
  profile: {
    itemsField: 'profiles',
    itemNameField: 'profileName',
  },
  layout: {
    itemsField: 'layouts',
    itemNameField: 'layoutName',
  },
  firmware: {
    itemsField: 'firmwares',
    itemNameField: 'firmwareName',
  },
} as const;

export const projectPackagesWriter = {
  async saveLocalProject(projectInfo: IProjectPackageInfo) {
    await dispatchCoreAction({
      project_saveLocalProjectPackageInfo: projectInfo,
    });
  },
  async saveLocalProjectResourceItem<
    T extends IProjectResourceItemType,
    Item = IResourceItemTypeMap[T],
  >(type: T, item: Item) {
    const { itemsField, itemNameField } = fieldNamesMap[type];
    await patchLocalEditProject((draft) =>
      insertItemToArray<any, any>(draft[itemsField], itemNameField, item),
    );
  },
  deleteLocalProjectResourceItem<T extends IProjectResourceItemType>(
    type: T,
    targetItemName: string,
  ) {
    const { itemsField, itemNameField } = fieldNamesMap[type];
    patchLocalEditProject((draft) =>
      removeItemFromArray<any, any>(
        draft[itemsField],
        itemNameField,
        targetItemName,
      ),
    );
  },
  renameLocalProjectResourceItem<T extends IProjectResourceItemType>(
    type: T,
    oldName: string,
    newName: string,
  ) {
    const { itemsField, itemNameField } = fieldNamesMap[type];
    patchLocalEditProject((draft) => {
      renameItemInArray<any, any>(
        draft[itemsField],
        itemNameField,
        oldName,
        newName,
      );
    });
  },
  copyLocalProjectResourceItem<T extends IProjectResourceItemType>(
    type: T,
    srcName: string,
    newName: string,
  ) {
    const { itemsField, itemNameField } = fieldNamesMap[type];
    patchLocalEditProject((draft) => {
      copyItemInArray<any, any>(
        draft[itemsField],
        itemNameField,
        srcName,
        newName,
      );
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
