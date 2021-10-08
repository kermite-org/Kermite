import { useEffect } from 'qx';
import { IGeneralMenuItem } from '~/ui/base';
import { createProjectResourceMenuItems } from '~/ui/features/ProjectResourcesPart/models/ProjectResourceMenuItems';
import { projectResourceStore } from '~/ui/features/ProjectResourcesPart/store';

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

export function useProjectResourcePageModel(): IProjectResourcePageModel {
  useEffect(projectResourceStore.actions.resetState, []);

  const menuItems = createProjectResourceMenuItems();
  const { selectedItemKey, keyboardName, resourceItemKeys } =
    projectResourceStore.readers;
  const {
    editSelectedResourceItem,
    clearSelection,
    setSelectedItemKey,
    handleKeyboardNameChange,
  } = projectResourceStore.actions;
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
