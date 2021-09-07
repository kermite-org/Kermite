import { IProjectPackageInfo } from '~/shared';
import { projectPackagesWriter, uiActions, uiReaders } from '~/ui/commonStore';
import { modalConfirm } from '~/ui/components';
import { resourceManagementUtils } from '~/ui/helpers';

type IProjectResourceItemType = 'preset' | 'layout' | 'firmware';
type IProjectResourceItem = {
  itemKey: string;
  itemType: IProjectResourceItemType;
  itemName: string;
  additionalInfoText?: string;
};

function encodeProjectResourceItemKey(
  itemType: IProjectResourceItemType,
  itemName: string,
): string {
  return `${itemType}#${itemName}`;
}

function decodeProjectResourceItemKey(key: string): {
  itemType: IProjectResourceItemType;
  itemName: string;
} {
  const [itemType, itemName] = key.split('#');
  return { itemType: itemType as IProjectResourceItemType, itemName };
}

const readers = {
  get projectInfo(): IProjectPackageInfo {
    return uiReaders.editTargetProject!;
  },
  get keyboardName(): string {
    const { projectInfo } = readers;
    return projectInfo.keyboardName;
  },
  get resourceItems(): IProjectResourceItem[] {
    const { projectInfo } = readers;
    return [
      ...projectInfo.firmwares.map((it) => ({
        itemKey: encodeProjectResourceItemKey('firmware', it.variationName),
        itemType: 'firmware' as const,
        itemName: it.variationName,
        additionalInfoText: `(${it.type})`,
      })),
      ...projectInfo.layouts.map((it) => ({
        itemKey: encodeProjectResourceItemKey('layout', it.layoutName),
        itemType: 'layout' as const,
        itemName: it.layoutName,
      })),
      ...projectInfo.presets.map((it) => ({
        itemKey: encodeProjectResourceItemKey('preset', it.presetName),
        itemType: 'preset' as const,
        itemName: it.presetName,
      })),
    ];
  },
};

const actions = {
  handleKeyboardNameChange(value: string) {
    const { projectInfo } = readers;
    const newProjectInfo = { ...projectInfo, keyboardName: value };
    projectPackagesWriter.saveLocalProject(newProjectInfo);
  },

  editResourceItem(itemKey: string) {
    const { projectInfo } = readers;
    const { itemType, itemName } = decodeProjectResourceItemKey(itemKey);
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

  async deleteResourceItem(itemKey: string) {
    const ok = await modalConfirm({
      caption: 'delete item',
      message: 'Resource item delete. Are you sure?',
    });
    if (ok) {
      const { itemType, itemName } = decodeProjectResourceItemKey(itemKey);
      if (itemType === 'preset') {
        projectPackagesWriter.deleteLocalProjectPreset(itemName);
      } else if (itemType === 'layout') {
        projectPackagesWriter.deleteLocalProjectLayout(itemName);
      } else if (itemType === 'firmware') {
        projectPackagesWriter.deleteLocalProjectFirmware(itemName);
      }
    }
  },
  async renameResourceItem(itemKey: string) {
    const { projectInfo } = readers;
    const { itemType, itemName } = decodeProjectResourceItemKey(itemKey);
    if (itemType === 'preset') {
      const allItemNames = projectInfo.presets.map((it) => it.presetName);
      const newName = await resourceManagementUtils.inputSavingResourceName({
        modalTitle: 'rename preset',
        modalMessage: 'new preset name',
        resourceTypeNameText: 'preset name',
        defaultText: itemName,
        existingResourceNames: allItemNames,
      });
      if (newName && newName !== itemName) {
        projectPackagesWriter.renameLocalProjectPreset(itemName, newName);
      }
    } else if (itemType === 'layout') {
      const allItemNames = projectInfo.layouts.map((it) => it.layoutName);
      const newName = await resourceManagementUtils.inputSavingResourceName({
        modalTitle: 'rename layout',
        modalMessage: 'new layout name',
        resourceTypeNameText: 'layout name',
        defaultText: itemName,
        existingResourceNames: allItemNames,
      });
      if (newName && newName !== itemName) {
        projectPackagesWriter.renameLocalProjectLayout(itemName, newName);
      }
    } else if (itemType === 'firmware') {
      const allItemNames = projectInfo.firmwares.map((it) => it.variationName);
      const newName = await resourceManagementUtils.inputSavingResourceName({
        modalTitle: 'rename firmware',
        modalMessage: 'new firmware name',
        resourceTypeNameText: 'firmware name',
        defaultText: itemName,
        existingResourceNames: allItemNames,
      });
      if (newName && newName !== itemName) {
        projectPackagesWriter.renameLocalProjectFirmware(itemName, newName);
      }
    }
  },
};

export function useProjectResourcePageModel() {
  return {
    ...readers,
    ...actions,
  };
}
