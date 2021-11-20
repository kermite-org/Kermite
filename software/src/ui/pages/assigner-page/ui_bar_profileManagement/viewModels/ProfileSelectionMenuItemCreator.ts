import { IGeneralMenuItem, texts } from '~/ui/base';
import { commitUiSettings, uiReaders, uiState } from '~/ui/store';
import { IProfileManagementPartViewModel } from './ProfilesOperationModel';

export function createProfileSelectionMenuItems(
  vm: IProfileManagementPartViewModel,
): IGeneralMenuItem[] {
  return [
    {
      type: 'menuEntry',
      text: texts.label_assigner_menu_newProfile,
      hint: texts.hint_assigner_menu_newProfile,
      handler: vm.createProfile,
    },
    {
      type: 'menuEntry',
      text: texts.label_assigner_menu_renameProfile,
      hint: texts.hint_assigner_menu_renameProfile,
      handler: vm.renameProfile,
      hidden: !vm.isCurrentProfileInternal,
    },
    {
      type: 'menuEntry',
      text: texts.label_assigner_menu_copyProfile,
      hint: texts.hint_assigner_menu_copyProfile,
      handler: vm.copyProfile,
      hidden: !vm.isCurrentProfileInternal,
    },
    {
      type: 'menuEntry',
      text: texts.label_assigner_menu_deleteProfile,
      hint: texts.hint_assigner_menu_deleteProfile,
      handler: vm.deleteProfile,
      hidden: !vm.isCurrentProfileInternal,
    },
    {
      type: 'menuEntry',
      text: texts.label_assigner_menu_saveProfile,
      hint: texts.hint_assigner_menu_saveProfile,
      handler: vm.handleSaveUnsavedProfile,
      hidden: !vm.isMenuItemSaveEnabled,
    },
    { type: 'separator' },
    {
      type: 'menuEntry',
      text: texts.label_assigner_menu_importFromFile,
      hint: texts.hint_assigner_menu_importFromFile,
      handler: vm.handleImportFromFile,
      hidden: !uiReaders.isDeveloperMode,
    },
    {
      type: 'menuEntry',
      text: texts.label_assigner_menu_exportToFile,
      hint: texts.hint_assigner_menu_exportToFile,
      handler: vm.handleExportToFile,
      hidden: !(uiReaders.isDeveloperMode && vm.isEditProfileAvailable),
    },
    {
      type: 'menuEntry',
      text: 'Load From Project Preset',
      hint: 'Load From Project Preset',
      handler: vm.openLoadingPresetSelectionModal,
      hidden: !(
        uiReaders.isLocalProjectSelectedForEdit && !!vm.currentProfileProjectId
      ),
    },
    {
      type: 'menuEntry',
      text: texts.label_assigner_menu_saveAsPreset,
      hint: texts.hint_assigner_menu_saveAsPreset,
      handler: vm.openSavingPresetSelectionModal,
      hidden: !(
        uiReaders.isLocalProjectSelectedForEdit && !!vm.currentProfileProjectId
      ),
    },
    { type: 'separator' },
    {
      type: 'menuEntry',
      text: texts.label_assigner_menu_openUserProfilesFolder,
      hint: texts.hint_assigner_menu_openUserProfilesFolder,
      handler: vm.openUserProfilesFolder,
      hidden: !vm.isCurrentProfileInternal,
    },
    {
      type: 'menuEntry',
      text: texts.label_globalMenu_showTestInputArea,
      handler: () =>
        commitUiSettings({
          showTestInputArea: !uiState.settings.showTestInputArea,
        }),
      checked: uiState.settings.showTestInputArea,
      hint: texts.hint_globalMenu_showTestInputArea,
    },
  ];
}
