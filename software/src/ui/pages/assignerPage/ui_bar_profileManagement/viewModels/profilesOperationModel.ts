import { useState } from 'alumina';
import { assignerModel } from '~/ui/featureEditors';
import {
  profilesActions,
  profilesReader,
} from '~/ui/pages/assignerPage/models';
import { profilesOperationActions } from '~/ui/pages/assignerPage/ui_bar_profileManagement/viewModels/profilesOperationModel.Actions';
import { profilesOperationReader } from '~/ui/pages/assignerPage/ui_bar_profileManagement/viewModels/profilesOperationModel.Readers';

export type IProfileManagerModalState =
  | 'None'
  | 'LoadFromProject'
  | 'SaveToProject';

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
  modalState: IProfileManagerModalState;
  openLoadingPresetSelectionModal(): void;
  openSavingPresetSelectionModal(): void;
  closeModal(): void;
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
  handlePostToServer(): void;
}

export function makeProfilesOperationModel(): IProfileManagementPartViewModel {
  const { isEditProfileAvailable } = profilesReader;
  const [modalState, setModalState] =
    useState<IProfileManagerModalState>('None');

  const currentProfileProjectId = assignerModel.loadedProfileData.projectId;

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
    handlePostToServer,
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
    modalState,
    openLoadingPresetSelectionModal: () => setModalState('LoadFromProject'),
    openSavingPresetSelectionModal: () => setModalState('SaveToProject'),
    closeModal: () => setModalState('None'),
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
    handlePostToServer,
  };
}
