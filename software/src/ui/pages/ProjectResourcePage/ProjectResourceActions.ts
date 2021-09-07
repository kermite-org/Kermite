import { decodeProjectResourceItemKey } from '~/shared';
import { projectPackagesWriter, uiActions, uiReaders } from '~/ui/commonStore';
import { modalConfirm } from '~/ui/components';
import { resourceManagementUtils } from '~/ui/helpers';
import {
  projectResourceReaders,
  projectResourceState,
} from '~/ui/pages/ProjectResourcePage/ProjectResourceState';

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
    }
  },
};

export const projectResourceActions = {
  setSelectedItemKey(key: string) {
    projectResourceState.selectedItemKey = key;
  },
  clearSelection() {
    projectResourceState.selectedItemKey = '';
  },
  createStandardFirmware() {
    uiActions.navigateTo({
      type: 'projectStandardFirmwareEdit',
      variationName: '',
    });
  },
  createCustomFirmware() {
    uiActions.openPageModal({
      type: 'projectCustomFirmwareSetup',
      variationName: '',
    });
  },
  editSelectedResourceItem() {
    const projectInfo = uiReaders.editTargetProject!;
    const { selectedItemKey } = projectResourceReaders;
    const { itemType, itemName } =
      decodeProjectResourceItemKey(selectedItemKey);
    if (itemType === 'preset') {
      uiActions.navigateTo({ type: 'projectPresetEdit', presetName: itemName });
    } else if (itemType === 'layout') {
      uiActions.navigateTo({ type: 'projectLayoutEdit', layoutName: itemName });
    } else if (itemType === 'firmware') {
      const variationName = itemName;
      const firmwareInfo = projectInfo.firmwares.find(
        (it) => it.variationName === variationName,
      );
      if (firmwareInfo?.type === 'standard') {
        uiActions.navigateTo({
          type: 'projectStandardFirmwareEdit',
          variationName,
        });
      } else if (firmwareInfo?.type === 'custom') {
        uiActions.openPageModal({
          type: 'projectCustomFirmwareSetup',
          variationName,
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
      if (itemType === 'preset') {
        projectPackagesWriter.deleteLocalProjectPreset(itemName);
      } else if (itemType === 'layout') {
        projectPackagesWriter.deleteLocalProjectLayout(itemName);
      } else if (itemType === 'firmware') {
        projectPackagesWriter.deleteLocalProjectFirmware(itemName);
      }
    }
  },
  renameSelectedResourceItem() {
    const projectInfo = uiReaders.editTargetProject!;
    const { selectedItemKey } = projectResourceReaders;
    const { itemType, itemName } =
      decodeProjectResourceItemKey(selectedItemKey);
    if (itemType === 'preset') {
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
      const allItemNames = projectInfo.firmwares.map((it) => it.variationName);
      helpers.renameProjectResourceListItem(
        'firmware',
        itemName,
        allItemNames,
        projectPackagesWriter.renameLocalProjectFirmware,
      );
    }
  },
};
