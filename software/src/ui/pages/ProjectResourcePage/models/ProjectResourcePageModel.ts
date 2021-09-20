import { useEffect } from 'qx';
import { IGeneralMenuItem } from '~/ui/base';
import {
  projectResourceActions,
  projectResourceReaders,
} from '~/ui/pages/ProjectResourcePage/core';
import { createProjectResourceMenuItems } from '~/ui/pages/ProjectResourcePage/models/ProjectResourceMenuItems';

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
  useEffect(projectResourceActions.resetState, []);
  const menuItems = createProjectResourceMenuItems();
  const { selectedItemKey, keyboardName, resourceItemKeys } =
    projectResourceReaders;
  const {
    editSelectedResourceItem,
    clearSelection,
    setSelectedItemKey,
    handleKeyboardNameChange,
  } = projectResourceActions;
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
