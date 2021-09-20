import { decodeProjectResourceItemKey } from '~/shared';
import { modalConfirm } from '~/ui/components';
import { projectPackagesWriter } from '~/ui/store/ProjectPackages';
import { uiActions, uiReaders } from '~/ui/store/base';
import { projectResourceReaders } from '~/ui/store/projectResource/readers';
import { projectResourceState } from '~/ui/store/projectResource/state';
import { resourceManagementUtils } from '~/ui/utils';

const helpers = {
  async renameProjectResourceListItem(
    target: string,
    itemName: string,
    allItemNames: string[],
    destinationFunction: (oldName: string, newName: string) => void,
  ) {
    const newName = await resourceManagementUtils.inputSavingResourceName({
      modalTitle: `rename ${target}`,
      modalMessage: `new ${target} name`,
      resourceTypeNameText: `${target} name`,
      defaultText: itemName,
      existingResourceNames: allItemNames,
    });
    if (newName && newName !== itemName) {
      destinationFunction(itemName, newName);
      projectResourceState.selectedItemKey =
        projectResourceState.selectedItemKey.replace(itemName, newName);
    }
  },
};

export const projectResourceActions = {
  resetState() {
    if (!projectResourceReaders.isSelectedItemKeyIncludedInList) {
      projectResourceActions.clearSelection();
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
    uiActions.navigateTo({
      type: 'projectStandardFirmwareEdit',
      firmwareName: '',
    });
  },
  createCustomFirmware() {
    uiActions.navigateTo({
      type: 'projectCustomFirmwareSetup',
      firmwareName: '',
    });
  },
  editSelectedResourceItem() {
    const projectInfo = uiReaders.editTargetProject!;
    const { selectedItemKey } = projectResourceReaders;
    const { itemType, itemName } =
      decodeProjectResourceItemKey(selectedItemKey);
    if (itemType === 'profile') {
      uiActions.navigateTo({ type: 'projectPresetEdit', presetName: itemName });
    } else if (itemType === 'layout') {
      uiActions.navigateTo({ type: 'projectLayoutEdit', layoutName: itemName });
    } else if (itemType === 'firmware') {
      const firmwareName = itemName;
      const firmwareInfo = projectInfo.firmwares.find(
        (it) => it.firmwareName === firmwareName,
      );
      if (firmwareInfo?.type === 'standard') {
        uiActions.navigateTo({
          type: 'projectStandardFirmwareEdit',
          firmwareName,
        });
      } else if (firmwareInfo?.type === 'custom') {
        uiActions.navigateTo({
          type: 'projectCustomFirmwareSetup',
          firmwareName,
        });
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
      if (itemType === 'profile') {
        projectPackagesWriter.deleteLocalProjectPreset(itemName);
      } else if (itemType === 'layout') {
        projectPackagesWriter.deleteLocalProjectLayout(itemName);
      } else if (itemType === 'firmware') {
        projectPackagesWriter.deleteLocalProjectFirmware(itemName);
      }
      projectResourceActions.clearSelection();
    }
  },
  renameSelectedResourceItem() {
    const projectInfo = uiReaders.editTargetProject!;
    const { selectedItemKey } = projectResourceReaders;
    const { itemType, itemName } =
      decodeProjectResourceItemKey(selectedItemKey);
    if (itemType === 'profile') {
      const allItemNames = projectInfo.presets.map((it) => it.presetName);
      helpers.renameProjectResourceListItem(
        'preset',
        itemName,
        allItemNames,
        projectPackagesWriter.renameLocalProjectPreset,
      );
    } else if (itemType === 'layout') {
      const allItemNames = projectInfo.layouts.map((it) => it.layoutName);
      helpers.renameProjectResourceListItem(
        'layout',
        itemName,
        allItemNames,
        projectPackagesWriter.renameLocalProjectLayout,
      );
    } else if (itemType === 'firmware') {
      const allItemNames = projectInfo.firmwares.map((it) => it.firmwareName);
      helpers.renameProjectResourceListItem(
        'firmware',
        itemName,
        allItemNames,
        projectPackagesWriter.renameLocalProjectFirmware,
      );
    }
  },
  copySelectedResourceItem() {
    const projectInfo = uiReaders.editTargetProject!;
    const { selectedItemKey } = projectResourceReaders;
    const { itemType, itemName } =
      decodeProjectResourceItemKey(selectedItemKey);
    if (itemType === 'profile') {
      const allItemNames = projectInfo.presets.map((it) => it.presetName);
      helpers.renameProjectResourceListItem(
        'preset',
        itemName,
        allItemNames,
        projectPackagesWriter.copyLocalProjectPreset,
      );
    } else if (itemType === 'layout') {
      const allItemNames = projectInfo.layouts.map((it) => it.layoutName);
      helpers.renameProjectResourceListItem(
        'layout',
        itemName,
        allItemNames,
        projectPackagesWriter.copyLocalProjectLayout,
      );
    } else if (itemType === 'firmware') {
      const allItemNames = projectInfo.firmwares.map((it) => it.firmwareName);
      helpers.renameProjectResourceListItem(
        'firmware',
        itemName,
        allItemNames,
        projectPackagesWriter.copyLocalProjectFirmware,
      );
    }
  },
};
