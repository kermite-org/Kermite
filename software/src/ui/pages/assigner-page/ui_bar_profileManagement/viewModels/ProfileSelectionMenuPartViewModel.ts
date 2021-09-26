import { useLocal } from 'qx';
import { texts } from '~/ui/base';
import { uiReaders } from '~/ui/store';
import { IProfileManagementPartViewModel } from './ProfilesOperationModel';

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
      text: texts.label_assigner_menu_newProfile,
      hint: texts.hint_assigner_menu_newProfile,
      handler: vm.createProfile,
      enabled: true,
    },
    {
      key: 'renameProfile',
      text: texts.label_assigner_menu_renameProfile,
      hint: texts.hint_assigner_menu_renameProfile,
      handler: vm.renameProfile,
      enabled: vm.isCurrentProfileInternal,
    },
    {
      key: 'copyProfile',
      text: texts.label_assigner_menu_copyProfile,
      hint: texts.hint_assigner_menu_copyProfile,
      handler: vm.copyProfile,
      enabled: vm.isCurrentProfileInternal,
    },
    {
      key: 'deleteProfile',
      text: texts.label_assigner_menu_deleteProfile,
      hint: texts.hint_assigner_menu_deleteProfile,
      handler: vm.deleteProfile,
      enabled: vm.isCurrentProfileInternal,
    },
    {
      key: 'saveAs',
      text: texts.label_assigner_menu_saveProfile,
      hint: texts.hint_assigner_menu_saveProfile,
      handler: vm.handleSaveUnsavedProfile,
      enabled: vm.isMenuItemSaveEnabled,
    },
    {
      key: 'importFromFile',
      text: texts.label_assigner_menu_importFromFile,
      hint: texts.hint_assigner_menu_importFromFile,
      handler: vm.handleImportFromFile,
      enabled: uiReaders.isDeveloperMode,
    },
    {
      key: 'exportToFile',
      text: texts.label_assigner_menu_exportToFile,
      hint: texts.hint_assigner_menu_exportToFile,
      handler: vm.handleExportToFile,
      enabled: uiReaders.isDeveloperMode && vm.isEditProfileAvailable,
    },
    {
      key: 'loadFromPreset',
      text: 'Load From Project Preset',
      hint: 'Load From Project Preset',
      handler: vm.openLoadingPresetSelectionModal,
      enabled: isLocalProjectsAvailable && !!vm.currentProfileProjectId,
    },
    {
      key: 'saveAsPreset',
      text: texts.label_assigner_menu_saveAsPreset,
      hint: texts.hint_assigner_menu_saveAsPreset,
      handler: vm.openSavingPresetSelectionModal,
      enabled: isLocalProjectsAvailable && !!vm.currentProfileProjectId,
    },
    {
      key: 'openUserProfilesFolder',
      text: texts.label_assigner_menu_openUserProfilesFolder,
      hint: texts.hint_assigner_menu_openUserProfilesFolder,
      handler: vm.openUserProfilesFolder,
      enabled: vm.isCurrentProfileInternal,
    },
  ];
}

export function makeProfileSelectionMenuPartViewModel(
  vm: IProfileManagementPartViewModel,
) {
  const state = useLocal({ isOpen: false });
  const menuItemsSource = createMenuItemSources(
    vm,
    uiReaders.isLocalProjectSelectedForEdit,
  );

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
