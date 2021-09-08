import { useEffect } from 'qx';
import { IProjectPackageInfo, encodeProjectResourceItemKey } from '~/shared';
import { IGeneralMenuItem } from '~/ui/base';
import { projectPackagesWriter, uiReaders } from '~/ui/commonStore';
import { createSimpleSelector } from '~/ui/helpers';
import { projectResourceActions } from '~/ui/pages/ProjectResourcePage/core/ProjectResourceActions';
import { projectResourceReaders } from '~/ui/pages/ProjectResourcePage/core/ProjectResourceState';
import { createProjectResourceMenuItems } from '~/ui/pages/ProjectResourcePage/models/ProjectResourceMenuModel';

interface IProjectResourcePageModel {
  keyboardName: string;
  handleKeyboardNameChange(value: string): void;
  resourceItemKeys: string[];
  selectedItemKey: string;
  setSelectedItemKey(itemKey: string): void;
  clearSelection(): void;
  editSelectedResourceItem(): void;
  menuItems: IGeneralMenuItem[];
}

function createProjectResourceListItemKeys(
  projectInfo: IProjectPackageInfo,
): string[] {
  return [
    ...projectInfo.presets.map((it) =>
      encodeProjectResourceItemKey('preset', it.presetName),
    ),
    ...projectInfo.layouts.map((it) =>
      encodeProjectResourceItemKey('layout', it.layoutName),
    ),
    ...projectInfo.firmwares.map((it) =>
      encodeProjectResourceItemKey('firmware', it.variationName),
    ),
  ];
}

const resourceItemsSelector = createSimpleSelector(
  () => uiReaders.editTargetProject!,
  createProjectResourceListItemKeys,
);

const readers = {
  get keyboardName(): string {
    const projectInfo = uiReaders.editTargetProject!;
    return projectInfo.keyboardName;
  },
  get resourceItemKeys(): string[] {
    return resourceItemsSelector();
  },
  get isSelectedItemKeyIncludedInList() {
    const { selectedItemKey } = projectResourceReaders;
    const { resourceItemKeys } = readers;
    return resourceItemKeys.includes(selectedItemKey);
  },
};

const actions = {
  resetState() {
    if (!readers.isSelectedItemKeyIncludedInList) {
      projectResourceActions.clearSelection();
    }
  },
  handleKeyboardNameChange(value: string) {
    const projectInfo = uiReaders.editTargetProject!;
    const newProjectInfo = { ...projectInfo, keyboardName: value };
    projectPackagesWriter.saveLocalProject(newProjectInfo);
  },
};

export function useProjectResourcePageModel(): IProjectResourcePageModel {
  useEffect(() => actions.resetState, []);
  const { editSelectedResourceItem, clearSelection, setSelectedItemKey } =
    projectResourceActions;
  const menuItems = createProjectResourceMenuItems();
  const { selectedItemKey } = projectResourceReaders;
  const { keyboardName, resourceItemKeys } = readers;
  const { handleKeyboardNameChange } = actions;
  return {
    keyboardName,
    handleKeyboardNameChange,
    resourceItemKeys,
    selectedItemKey,
    setSelectedItemKey,
    clearSelection,
    menuItems,
    editSelectedResourceItem,
  };
}
