import {
  createProjectKey,
  decodeProjectResourceItemKey,
  IProjectPackageInfo,
  IProjectResourceItemType,
} from '~/shared';
import { modalConfirm } from '~/ui/components';
import { projectResourceReaders } from '~/ui/features/ProjectResourcesPart/store/readers';
import { projectResourceState } from '~/ui/features/ProjectResourcesPart/store/state';
import { projectPackagesWriter } from '~/ui/store/ProjectPackages';
import { dispatchCoreAction, uiActions, uiReaders } from '~/ui/store/base';
import { resourceManagementUtils } from '~/ui/utils';

const helpers = {
  getExistingResourceNames(
    projectInfo: IProjectPackageInfo,
    type: IProjectResourceItemType,
  ): string[] {
    if (type === 'profile') {
      return projectInfo.profiles.map((it) => it.profileName);
    } else if (type === 'layout') {
      return projectInfo.layouts.map((it) => it.layoutName);
    } else if (type === 'firmware') {
      return projectInfo.firmwares.map((it) => it.firmwareName);
    }
    throw new Error('invalid resource type');
  },
  async renameProjectResourceListItem(
    target: IProjectResourceItemType,
    itemName: string,
    allItemNames: string[],
    destinationFunction: (
      target: IProjectResourceItemType,
      oldName: string,
      newName: string,
    ) => void,
  ) {
    const newName = await resourceManagementUtils.inputSavingResourceName({
      modalTitle: `rename ${target}`,
      modalMessage: `new ${target} name`,
      resourceTypeNameText: `${target} name`,
      currentName: itemName,
      existingResourceNames: allItemNames,
    });
    if (newName && newName !== itemName) {
      destinationFunction(target, itemName, newName);
      projectResourceState.selectedItemKey =
        projectResourceState.selectedItemKey.replace(itemName, newName);
    }
  },
};

export const projectResourceActions = {
  resetState() {
    const { globalProjectKey } = uiReaders;
    if (globalProjectKey !== projectResourceState.loadedProjectKey) {
      projectResourceState.loadedProjectKey = globalProjectKey;
      projectResourceState.selectedItemKey = '';
    }
  },
  setSelectedItemKey(key: string) {
    projectResourceState.selectedItemKey = key;
  },
  clearSelection() {
    projectResourceState.selectedItemKey = '';
  },
  handleKeyboardNameChange(value: string) {
    const projectInfo = uiReaders.editTargetProject!;
    const newProjectInfo = { ...projectInfo, keyboardName: value };
    projectPackagesWriter.saveLocalProject(newProjectInfo);
  },
  createStandardFirmware() {
    const projectInfo = uiReaders.editTargetProject!;
    const projectKey = createProjectKey(
      projectInfo.origin,
      projectInfo.projectId,
    );
    uiActions.navigateTo({
      type: 'projectStandardFirmwareView',
      projectKey,
      firmwareName: '',
      canEdit: true,
    });
  },
  createCustomFirmware() {
    uiActions.navigateTo({ type: 'projectCustomFirmwareCreate' });
  },
  editSelectedResourceItem() {
    const projectInfo = uiReaders.editTargetProject!;
    const projectKey = createProjectKey(
      projectInfo.origin,
      projectInfo.projectId,
    );
    const { selectedItemKey } = projectResourceReaders;
    const { itemType, itemName } =
      decodeProjectResourceItemKey(selectedItemKey);
    if (itemType === 'profile') {
      uiActions.navigateTo({
        type: 'projectPresetView',
        projectKey,
        presetName: itemName,
        canEdit: true,
      });
    } else if (itemType === 'layout') {
      uiActions.navigateTo({
        type: 'projectLayoutView',
        projectKey,
        layoutName: itemName,
        canEdit: true,
      });
    } else if (itemType === 'firmware') {
      const firmwareName = itemName;
      const firmwareInfo = projectInfo.firmwares.find(
        (it) => it.firmwareName === firmwareName,
      );
      if (firmwareInfo?.type === 'standard') {
        uiActions.navigateTo({
          type: 'projectStandardFirmwareView',
          projectKey,
          firmwareName,
          canEdit: true,
        });
      } else if (firmwareInfo?.type === 'custom') {
        // uiActions.navigateTo({
        //   type: 'projectCustomFirmwareSetup',
        //   firmwareName,
        // });
      }
    }
  },
  async deleteSelectedResourceItem() {
    const { selectedItemKey } = projectResourceReaders;
    const { itemType, itemName } =
      decodeProjectResourceItemKey(selectedItemKey);
    const ok = await modalConfirm({
      caption: 'delete item',
      message: 'Resource item delete. Are you sure?',
    });
    if (ok) {
      projectPackagesWriter.deleteLocalProjectResourceItem(itemType, itemName);
      projectResourceActions.clearSelection();
    }
  },
  renameSelectedResourceItem() {
    const projectInfo = uiReaders.editTargetProject!;
    const { selectedItemKey } = projectResourceReaders;
    const { itemType, itemName } =
      decodeProjectResourceItemKey(selectedItemKey);
    const allItemNames = helpers.getExistingResourceNames(
      projectInfo,
      itemType,
    );
    helpers.renameProjectResourceListItem(
      itemType,
      itemName,
      allItemNames,
      projectPackagesWriter.renameLocalProjectResourceItem,
    );
  },
  copySelectedResourceItem() {
    const projectInfo = uiReaders.editTargetProject!;
    const { selectedItemKey } = projectResourceReaders;
    const { itemType, itemName } =
      decodeProjectResourceItemKey(selectedItemKey);

    const allItemNames = helpers.getExistingResourceNames(
      projectInfo,
      itemType,
    );
    helpers.renameProjectResourceListItem(
      itemType,
      itemName,
      allItemNames,
      projectPackagesWriter.copyLocalProjectResourceItem,
    );
  },
  shiftSelectedResourceItemOrderBackward() {
    const { selectedItemKey } = projectResourceReaders;
    const { itemType, itemName } =
      decodeProjectResourceItemKey(selectedItemKey);
    projectPackagesWriter.shiftLocalProjectResourceItemOrder(
      itemType,
      itemName,
      -1,
    );
  },
  shiftSelectedResourceItemOrderForward() {
    const { selectedItemKey } = projectResourceReaders;
    const { itemType, itemName } =
      decodeProjectResourceItemKey(selectedItemKey);
    projectPackagesWriter.shiftLocalProjectResourceItemOrder(
      itemType,
      itemName,
      1,
    );
  },
  handleOpenLocalProjectsFolder() {
    dispatchCoreAction({ project_openLocalProjectsFolder: 1 });
  },
};
