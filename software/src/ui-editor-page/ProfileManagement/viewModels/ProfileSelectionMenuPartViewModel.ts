import { useLocal } from '~/ui-common';
import { useProjectResourcePresenceChecker } from '~/ui-common/sharedModels/hooks';
import { IProfileManagementPartViewModel } from './ProfileManagementPartViewModel';

interface IMenuItem {
  key: string;
  text: string;
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
      text: 'new',
      handler: vm.createProfile,
      enabled: true,
    },
    {
      key: 'renameProfile',
      text: 'rename',
      handler: vm.renameProfile,
      enabled: vm.isCurrentProfileInternal,
    },
    {
      key: 'copyProfile',
      text: 'copy',
      handler: vm.copyProfile,
      enabled: vm.isCurrentProfileInternal,
    },
    {
      key: 'deleteProfile',
      text: 'delete',
      handler: vm.deleteProfile,
      enabled: vm.isCurrentProfileInternal,
    },
    {
      key: 'saveAsPreset',
      text: 'save as preset',
      handler: vm.openExportingPresetSelectionModal,
      enabled: isLocalProjectsAvailable && !!vm.currentProfileProjectId,
    },
    {
      key: 'importFromFile',
      text: 'import from file',
      handler: vm.handleImportFromFile,
      enabled: true,
    },
    {
      key: 'exportToFile',
      text: 'export to file',
      handler: vm.handleExportToFile,
      enabled: true,
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
      }));
    },
  };
}
