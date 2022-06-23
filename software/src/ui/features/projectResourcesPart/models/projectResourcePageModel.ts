import { useEffect } from 'alumina';
import { fallbackProjectPackageInfo, IProjectPackageInfo } from '~/shared';
import { IGeneralMenuItem } from '~/ui/base';
import { createProjectResourceMenuItems } from '~/ui/features/projectResourcesPart/models/projectResourceMenuItems';
import { projectResourceStore } from '~/ui/features/projectResourcesPart/store';
import { uiReaders } from '~/ui/store';

interface IProjectResourcePageModel {
  keyboardName: string;
  handleKeyboardNameChange(value: string): void;
  resourceItemKeys: string[];
  selectedItemKey: string;
  setSelectedItemKey(itemKey: string): void;
  clearSelection(): void;
  editSelectedResourceItem(): void;
  menuItems: IGeneralMenuItem[];
  editProjectInfo: IProjectPackageInfo;
  openDetailView: () => void;
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

  const editProjectInfo =
    uiReaders.editTargetProject || fallbackProjectPackageInfo;

  const openDetailView = projectResourceStore.actions.editSelectedResourceItem;
  return {
    keyboardName,
    handleKeyboardNameChange,
    resourceItemKeys,
    selectedItemKey,
    setSelectedItemKey,
    clearSelection,
    menuItems,
    editSelectedResourceItem,
    editProjectInfo,
    openDetailView,
  };
}
