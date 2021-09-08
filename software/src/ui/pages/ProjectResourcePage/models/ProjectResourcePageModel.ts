import { useEffect } from 'qx';
import { IGeneralMenuItem, IProjectResourceListItem } from '~/ui/base';
import { projectPackagesWriter, uiReaders } from '~/ui/commonStore';
import { projectResourceActions } from '~/ui/pages/ProjectResourcePage/core/ProjectResourceActions';
import { projectResourceReaders } from '~/ui/pages/ProjectResourcePage/core/ProjectResourceState';
import { createProjectResourceListItems } from '~/ui/pages/ProjectResourcePage/models/ProjectResourceListModel';
import { createProjectResourceMenuItems } from '~/ui/pages/ProjectResourcePage/models/ProjectResourceMenuModel';

interface IProjectResourcePageModel {
  keyboardName: string;
  handleKeyboardNameChange(value: string): void;
  resourceItems: IProjectResourceListItem[];
  selectedResourceItem: IProjectResourceListItem | undefined;
  clearSelection(): void;
  editSelectedResourceItem(): void;
  menuItems: IGeneralMenuItem[];
}
const readers = {
  get keyboardName(): string {
    const projectInfo = uiReaders.editTargetProject!;
    return projectInfo.keyboardName;
  },
  get resourceItems(): IProjectResourceListItem[] {
    const projectInfo = uiReaders.editTargetProject!;
    const { selectedItemKey } = projectResourceReaders;
    const { setSelectedItemKey } = projectResourceActions;
    return createProjectResourceListItems(
      projectInfo,
      selectedItemKey,
      setSelectedItemKey,
    );
  },
  get selectedResourceItem() {
    const { selectedItemKey } = projectResourceReaders;
    return readers.resourceItems.find((it) => it.itemKey === selectedItemKey);
  },
  get isSelectedItemKeyIncludedInList() {
    const { selectedItemKey } = projectResourceReaders;
    const { resourceItems } = readers;
    return resourceItems.some((it) => it.itemKey === selectedItemKey);
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
  const { editSelectedResourceItem, clearSelection } = projectResourceActions;
  const menuItems = createProjectResourceMenuItems();
  const { keyboardName, resourceItems, selectedResourceItem } = readers;
  const { handleKeyboardNameChange } = actions;
  return {
    keyboardName,
    handleKeyboardNameChange,
    resourceItems,
    selectedResourceItem,
    clearSelection,
    menuItems,
    editSelectedResourceItem,
  };
}
