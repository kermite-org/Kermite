import { useMemo } from 'alumina';
import produce from 'immer';
import {
  fallbackProjectPackageInfo,
  fileExtensions,
  getFileBaseNameFromFilePath,
  getFileNameFromHandle,
  getNextFirmwareVariationId,
  getOriginAndProjectIdFromProjectKey,
  ICustomFirmwareEntry,
  IFileReadHandle,
  IFileWriteHandle,
  IProjectFirmwareEntry,
  IProjectLayoutEntry,
  IProjectPackageInfo,
  IProjectProfileEntry,
  IProjectResourceItemType,
  IResourceOrigin,
  isNumberInRange,
  IStandardFirmwareEntry,
} from '~/shared';
import { ipcAgent } from '~/ui/base';
import { modalConfirm, modalError } from '~/ui/components';
import { dispatchCoreAction, uiReaders, uiState } from '~/ui/store/base';

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
      return uiReaders.activeProjectPackageInfos;
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

function renameItemInArray<T extends { [key in K]: string }, K extends string>(
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
): T | undefined {
  const index = items.findIndex((it) => it[nameFiled] === srcName);
  if (index >= 0) {
    const item = items[index];
    const copied = { ...item, [nameFiled]: newName };
    items.splice(index + 1, 0, copied);
    return copied;
  }
}

function shiftOrderItemInArray<T, K extends keyof T>(
  items: T[],
  nameFiled: K,
  targetItemName: Extract<T[K], string>,
  direction: -1 | 1,
) {
  const index = items.findIndex((it) => it[nameFiled] === targetItemName);
  const newIndex = index + direction;
  if (isNumberInRange(newIndex, 0, items.length - 1)) {
    [items[index], items[newIndex]] = [items[newIndex], items[index]];
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
      const copied = copyItemInArray<any, any>(
        draft[itemsField],
        itemNameField,
        srcName,
        newName,
      );
      if (copied && type === 'firmware') {
        const allItems = draft[itemsField] as IProjectFirmwareEntry[];
        const item = copied as IProjectFirmwareEntry;
        item.variationId = getNextFirmwareVariationId(
          allItems.map((it) => it.variationId),
        );
      }
    });
  },
  shiftLocalProjectResourceItemOrder<T extends IProjectResourceItemType>(
    type: T,
    targetItemName: string,
    direction: -1 | 1,
  ) {
    const { itemsField, itemNameField } = fieldNamesMap[type];
    patchLocalEditProject((draft) => {
      shiftOrderItemInArray<any, any>(
        draft[itemsField],
        itemNameField,
        targetItemName,
        direction,
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

export const projectPackagesActions = {
  async importLocalPackageFile(
    fileHandle: IFileReadHandle,
  ): Promise<string | undefined> {
    const fileName = await getFileNameFromHandle(fileHandle);
    const ext = fileExtensions.package;
    if (!fileName?.endsWith(ext)) {
      await modalError(`Invalid target file. Only ${ext} file can be loaded.`);
      return;
    }
    const packageName = getFileBaseNameFromFilePath(fileName, ext);
    const fileContent = (await ipcAgent.async.file_loadJsonFileContent(
      fileHandle,
    )) as { projectId: string };

    const loadedProjectId = fileContent.projectId;
    if (!loadedProjectId) {
      await modalError('invalid file content');
      return;
    }

    const existingLocalPackages = uiReaders.allProjectPackageInfos.filter(
      (it) => it.origin === 'local' && !it.isDraft,
    );

    const sameIdPackage = existingLocalPackages.find(
      (it) =>
        it.projectId === loadedProjectId && it.packageName !== packageName,
    );

    if (sameIdPackage) {
      await modalError(
        `Cannot add package due to projectId duplication. \nLocal package ${sameIdPackage.packageName} has the same projectId as of this.`,
      );
      return;
    }

    const sameNamePackage = existingLocalPackages.find(
      (it) => it.packageName === packageName,
    );

    if (sameNamePackage) {
      const ok = await modalConfirm({
        message: `Existing local package ${packageName} is overwritten. Are you ok?`,
        caption: 'import local package',
      });
      if (!ok) {
        return;
      }
    }
    await dispatchCoreAction({
      project_addLocalProjectFromFile: { fileHandle },
    });

    return loadedProjectId;
  },
  async exportLocalPackageToFile(
    fileHandle: IFileWriteHandle,
    projectId: string,
  ) {
    await dispatchCoreAction({
      project_exportLocalProjectToFile: { fileHandle, projectId },
    });
  },
};
