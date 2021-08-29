import { useModalDisplayStateModel } from '~/ui/commonModels/GeneralUiStateModels';
import { editorModel } from '~/ui/pages/editor-core/models/EditorModel';
import { profilesActions, profilesReader } from '~/ui/pages/editor-page/models';
import { profilesOperationActions } from '~/ui/pages/editor-page/ui_bar_profileManagement/viewModels/ProfilesOperationModel.Actions';
import { profilesOperationReader } from '~/ui/pages/editor-page/ui_bar_profileManagement/viewModels/ProfilesOperationModel.Readers';

export interface IProfileManagementPartViewModel {
  createProfile(): void;
  saveProfile(): void;
  renameProfile(): void;
  copyProfile(): void;
  deleteProfile(): void;
  openConfiguration(): void;
  canSave: boolean;
  canWrite: boolean;
  onSaveButton(): void;
  onWriteButton(): void;
  isExportingPresetSelectionModalOpen: boolean;
  openExportingPresetSelectionModal(): void;
  closeExportingPresetSelectionModal(): void;
  saveProfileAsPreset(projectId: string, presetName: string): void;
  currentProfileProjectId: string;
  handleImportFromFile(): void;
  handleExportToFile(): void;
  isCurrentProfileInternal: boolean;
  handleSaveUnsavedProfile(): void;
  openUserProfilesFolder(): void;

  toggleRoutingPanel(): void;
  isMenuItemSaveEnabled: boolean;
  isEditProfileAvailable: boolean;
}

export function makeProfilesOperationModel(): IProfileManagementPartViewModel {
  const { isEditProfileAvailable } = profilesReader;
  const {
    isOpen: isExportingPresetSelectionModalOpen,
    open: openExportingPresetSelectionModal,
    close: closeExportingPresetSelectionModal,
  } = useModalDisplayStateModel();

  const currentProfileProjectId = editorModel.loadedProfileData.projectId;

  const { saveProfile, exportProfileAsProjectPreset: saveProfileAsPreset } =
    profilesActions;

  const {
    canSaveProfile: canSave,
    CanWriteKeyMappingToDevice: canWrite,
    isCurrentProfileInternal,
    isMenuItemSaveEnabled,
  } = profilesOperationReader;

  const {
    createProfile,
    renameProfile,
    copyProfile,
    deleteProfile,
    openConfiguration,
    onSaveButton,
    handleImportFromFile,
    handleExportToFile,
    openUserProfilesFolder,
    onWriteButton,
    toggleRoutingPanel,
    handleSaveUnsavedProfile,
  } = profilesOperationActions;

  return {
    createProfile,
    saveProfile,
    renameProfile,
    copyProfile,
    deleteProfile,
    openConfiguration,
    canSave,
    canWrite,
    onSaveButton,
    onWriteButton,
    isExportingPresetSelectionModalOpen,
    openExportingPresetSelectionModal,
    closeExportingPresetSelectionModal,
    saveProfileAsPreset,
    currentProfileProjectId,
    isCurrentProfileInternal,
    handleSaveUnsavedProfile,
    handleImportFromFile,
    handleExportToFile,
    openUserProfilesFolder,
    toggleRoutingPanel,
    isMenuItemSaveEnabled,
    isEditProfileAvailable,
  };
}
