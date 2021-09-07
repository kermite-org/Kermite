import { useEffect } from 'qx';
import {
  decodeProjectResourceItemKey,
  encodeProjectResourceItemKey,
  IProjectPackageInfo,
  IProjectResourceItemType,
} from '~/shared';
import { IProjectResourceListItem } from '~/ui/base';
import { projectPackagesWriter, uiActions, uiReaders } from '~/ui/commonStore';
import { modalConfirm } from '~/ui/components';
import { resourceManagementUtils } from '~/ui/helpers';

const state = new (class {
  selectedItemKey: string = '';
})();

const helpers = {
  createProjectResourceListItem(
    itemType: IProjectResourceItemType,
    itemName: string,
    selectedItemKey: string,
    setSelectedItemKey: (itemKey: string) => void,
  ): IProjectResourceListItem {
    const itemKey = encodeProjectResourceItemKey(itemType, itemName);
    const selected = itemKey === selectedItemKey;
    const setSelected = () => setSelectedItemKey(itemKey);
    return {
      itemKey,
      itemType,
      itemName,
      selected,
      setSelected,
    };
  },
};

const readers = {
  get selectedItemKey(): string {
    return state.selectedItemKey;
  },
  get projectInfo(): IProjectPackageInfo {
    return uiReaders.editTargetProject!;
  },
  get keyboardName(): string {
    const { projectInfo } = readers;
    return projectInfo.keyboardName;
  },
  get resourceItems(): IProjectResourceListItem[] {
    const { selectedItemKey } = state;
    const { projectInfo } = readers;
    const setSelectedItemKey = (key: string) => {
      state.selectedItemKey = key;
    };
    return [
      ...projectInfo.firmwares.map((it) =>
        helpers.createProjectResourceListItem(
          'firmware',
          it.variationName,
          selectedItemKey,
          setSelectedItemKey,
        ),
      ),
      ...projectInfo.layouts.map((it) =>
        helpers.createProjectResourceListItem(
          'layout',
          it.layoutName,
          selectedItemKey,
          setSelectedItemKey,
        ),
      ),
      ...projectInfo.presets.map((it) =>
        helpers.createProjectResourceListItem(
          'preset',
          it.presetName,
          selectedItemKey,
          setSelectedItemKey,
        ),
      ),
    ];
  },
};

const actions = {
  resetState() {
    if (
      !readers.resourceItems.some(
        (it) => it.itemKey === readers.selectedItemKey,
      )
    ) {
      state.selectedItemKey = '';
    }
  },
  clearSelection() {
    state.selectedItemKey = '';
  },
  handleKeyboardNameChange(value: string) {
    const { projectInfo } = readers;
    const newProjectInfo = { ...projectInfo, keyboardName: value };
    projectPackagesWriter.saveLocalProject(newProjectInfo);
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
    const { selectedItemKey, projectInfo } = readers;
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
    const { selectedItemKey } = readers;
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
  async renameSelectedResourceItem() {
    const { selectedItemKey, projectInfo } = readers;
    const { itemType, itemName } =
      decodeProjectResourceItemKey(selectedItemKey);
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
  useEffect(() => actions.resetState, []);
  return {
    ...readers,
    ...actions,
  };
}
