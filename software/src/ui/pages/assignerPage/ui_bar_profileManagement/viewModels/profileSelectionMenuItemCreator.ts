import { featureConfig } from '~/shared';
import { IGeneralMenuItem, texts } from '~/ui/base';
import { commitUiSettings, uiReaders, uiState } from '~/ui/store';
import { IProfileManagementPartViewModel } from './profilesOperationModel';

export function createProfileSelectionMenuItems(
  vm: IProfileManagementPartViewModel,
): IGeneralMenuItem[] {
  return [
    {
      type: 'menuEntry',
      text: texts.assignerMenu.newProfile,
      hint: texts.assignerMenuHint.newProfile,
      handler: vm.createProfile,
    },
    {
      type: 'menuEntry',
      text: texts.assignerMenu.renameProfile,
      hint: texts.assignerMenuHint.renameProfile,
      handler: vm.renameProfile,
      hidden: !vm.isCurrentProfileInternal,
    },
    {
      type: 'menuEntry',
      text: texts.assignerMenu.copyProfile,
      hint: texts.assignerMenuHint.copyProfile,
      handler: vm.copyProfile,
      hidden: !vm.isCurrentProfileInternal,
    },
    {
      type: 'menuEntry',
      text: texts.assignerMenu.deleteProfile,
      hint: texts.assignerMenuHint.deleteProfile,
      handler: vm.deleteProfile,
      hidden: !vm.isCurrentProfileInternal,
    },
    {
      type: 'menuEntry',
      text: texts.assignerMenu.saveProfile,
      hint: texts.assignerMenuHint.saveProfile,
      handler: vm.handleSaveUnsavedProfile,
      hidden: !vm.isMenuItemSaveEnabled,
    },
    { type: 'separator' },
    {
      type: 'menuEntry',
      text: texts.assignerMenu.importFromFile,
      hint: texts.assignerMenuHint.importFromFile,
      handler: vm.handleImportFromFile,
      // hidden: !uiReaders.isDeveloperMode,
    },
    {
      type: 'menuEntry',
      text: texts.assignerMenu.exportToFile,
      hint: texts.assignerMenuHint.exportToFile,
      handler: vm.handleExportToFile,
      // hidden: !(uiReaders.isDeveloperMode && vm.isEditProfileAvailable),
      hidden: !vm.isEditProfileAvailable,
    },
    { type: 'separator' },
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
      text: texts.assignerMenu.saveAsPreset,
      hint: texts.assignerMenuHint.saveAsPreset,
      handler: vm.openSavingPresetSelectionModal,
      hidden: !(
        uiReaders.isLocalProjectSelectedForEdit && !!vm.currentProfileProjectId
      ),
    },
    // { type: 'separator' },
    {
      type: 'menuEntry',
      text: 'Submit on KermiteServer',
      hint: 'Submit on KermiteServer',
      handler: vm.handlePostToServer,
      hidden: !(featureConfig.debugFullFeatures && vm.isCurrentProfileInternal),
    },
    { type: 'separator' },
    // {
    //   type: 'menuEntry',
    //   text: texts.assignerMenu.openUserProfilesFolder,
    //   hint: texts.assignerMenuHint.openUserProfilesFolder,
    //   handler: vm.openUserProfilesFolder,
    //   hidden: !vm.isCurrentProfileInternal,
    // },
    {
      type: 'menuEntry',
      text: texts.globalMenu.showTestInputArea,
      handler: () =>
        commitUiSettings({
          showTestInputArea: !uiState.settings.showTestInputArea,
        }),
      checked: uiState.settings.showTestInputArea,
      hint: texts.globalMenuHint.showTestInputArea,
    },
  ];
}
