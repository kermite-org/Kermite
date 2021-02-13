import { texts, useLocal } from '~/ui-common';
import { useProjectResourcePresenceChecker } from '~/ui-common/sharedModels/hooks';
import { IProfileManagementPartViewModel } from './ProfileManagementPartViewModel';

interface IMenuItem {
  key: string;
  text: string;
  hint: string;
  handler(): void;
  enabled: boolean;
}

export interface IProfileSelectionMenuPartViewModel {
  isOpen: boolean;
  openMenu(): void;
  closeMenu(): void;
  menuItems: IMenuItem[];
}

function createMenuItemSources(
  vm: IProfileManagementPartViewModel,
  isLocalProjectsAvailable: boolean,
): IMenuItem[] {
  return [
    {
      key: 'createProfile',
      text: texts.labelAssignerMenuNew,
      hint: texts.hintAssignerMenuCreateNewProfile,
      handler: vm.createProfile,
      enabled: true,
    },
    {
      key: 'renameProfile',
      text: texts.labelAssignerMenuRename,
      hint: texts.hintAssignerMenuRenameProfile,
      handler: vm.renameProfile,
      enabled: vm.isCurrentProfileInternal,
    },
    {
      key: 'copyProfile',
      text: texts.labelAssignerMenuCopy,
      hint: texts.hintAssignerMenuCopyProfile,
      handler: vm.copyProfile,
      enabled: vm.isCurrentProfileInternal,
    },
    {
      key: 'deleteProfile',
      text: texts.labelAssignerMenuDelete,
      hint: texts.hintAssignerMenuDeleteProfile,
      handler: vm.deleteProfile,
      enabled: vm.isCurrentProfileInternal,
    },
    {
      key: 'saveAs',
      text: 'save',
      hint: 'save',
      handler: vm.handleSaveUnsavedProfile,
      enabled: !vm.isCurrentProfileInternal,
    },
    {
      key: 'importFromFile',
      text: 'import from file',
      hint: 'import from file',
      handler: vm.handleImportFromFile,
      enabled: true,
    },
    {
      key: 'exportToFile',
      text: 'export to file',
      hint: 'export to file',
      handler: vm.handleExportToFile,
      enabled: true,
    },
    {
      key: 'saveAsPreset',
      text: texts.labelAssignerMenuSaveAsPreset,
      hint: texts.hintAssignerMenuSaveAsPreset,
      handler: vm.openExportingPresetSelectionModal,
      enabled: isLocalProjectsAvailable && !!vm.currentProfileProjectId,
    },
  ];
}

export function makeProfileSelectionMenuPartViewModel(
  vm: IProfileManagementPartViewModel,
) {
  const state = useLocal({ isOpen: false });
  const isLocalProjectsAvailable = useProjectResourcePresenceChecker('local');
  const menuItemsSource = createMenuItemSources(vm, isLocalProjectsAvailable);

  return {
    get isOpen() {
      return state.isOpen;
    },
    openMenu() {
      state.isOpen = true;
    },
    closeMenu() {
      state.isOpen = false;
    },
    get menuItems() {
      return menuItemsSource.map((item) => ({
        key: item.key,
        text: item.text,
        handler() {
          item.handler();
          state.isOpen = false;
        },
        enabled: item.enabled,
        hint: item.hint,
      }));
    },
  };
}
