import { Hook } from 'qx';
import { ISelectorSource, makePlainSelectorOption } from '~/ui-common';
import {
  modalAlert,
  modalTextEdit,
  modalConfirm,
} from '~/ui-common/fundamental/dialog/BasicModals';
import { uiStatusModel } from '~/ui-root/zones/common/commonModels/UiStatusModel';
import { editorModel } from '~/ui-root/zones/editor/models/EditorModel';
import { callProfileSetupModal } from '~/ui-root/zones/editor/views/modals/ProfileSetupModal';
import { keyboardConfigModel } from '~/ui-root/zones/editorProfilesSection/models/KeyboardConfigModel';
import { profilesModel } from '~/ui-root/zones/editorProfilesSection/models/ProfilesModel';

export interface IProfileManagementPartViewModel {
  currentProfileName: string;
  allProfileNames: string[];
  createProfile(): void;
  loadProfile(name: string): void;
  saveProfile(): void;
  renameProfile(): void;
  copyProfile(): void;
  deleteProfile(): void;
  openConfiguration(): void;
  onLaunchButton(): void;
  profileSelectorSource: ISelectorSource;
  isExportingPresetSelectionModalOpen: boolean;
  openExportingPresetSelectionModal(): void;
  closeExportingPresetSelectionModal(): void;
  saveProfileAsPreset(projectId: string, presetName: string): void;
  currentProfileProjectId: string;
}

export function makeProfileManagementPartViewModel(): IProfileManagementPartViewModel {
  const [isPresetsModalOpen, setIsPresetModalOpen] = Hook.useState(false);

  const openExportingPresetSelectionModal = async () => {
    setIsPresetModalOpen(true);
  };
  const closeExportingPresetSelectionModal = () => {
    setIsPresetModalOpen(false);
  };

  const {
    currentProfileName,
    allProfileNames,
    loadProfile,
    saveProfile,
  } = profilesModel;

  const checkValidNewProfileName = async (
    newProfileName: string,
  ): Promise<boolean> => {
    if (!newProfileName.match(/^[^/./\\:*?"<>|]+$/)) {
      await modalAlert(
        `${newProfileName} is not for valid filename. operation cancelled.`,
      );
      return false;
    }
    if (profilesModel.allProfileNames.includes(newProfileName)) {
      await modalAlert(
        `${newProfileName} is already exists. operation cancelled.`,
      );
      return false;
    }
    return true;
  };

  const createProfile = async () => {
    const res = await callProfileSetupModal(undefined);
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    if (res && res.profileName && res.targetProjectId && res.layoutName) {
      const { profileName, targetProjectId, layoutName } = res;
      const nameValid = await checkValidNewProfileName(profileName);
      if (nameValid) {
        profilesModel.createProfile(profileName, targetProjectId, {
          type: 'blank',
          layoutName,
        });
      }
    }
  };

  const inputNewProfileName = async (
    caption: string,
  ): Promise<string | undefined> => {
    const newProfileName = await modalTextEdit({
      message: 'New Profile Name',
      defaultText: currentProfileName,
      caption,
    });
    if (newProfileName) {
      const nameValid = await checkValidNewProfileName(newProfileName);
      if (nameValid) {
        return newProfileName;
      }
    }
    return undefined;
  };

  const renameProfile = async () => {
    const newProfileName = await inputNewProfileName('Rename Profile');
    if (newProfileName) {
      profilesModel.renameProfile(newProfileName);
    }
  };

  const copyProfile = async () => {
    const newProfileName = await inputNewProfileName('Copy Profile');
    if (newProfileName) {
      profilesModel.copyProfile(newProfileName);
    }
  };

  const deleteProfile = async () => {
    const ok = await modalConfirm({
      message: `Profile ${currentProfileName} will be deleted. Are you sure?`,
      caption: 'Delete Profile',
    });
    if (ok) {
      profilesModel.deleteProfile();
    }
  };

  const openConfiguration = () => {
    uiStatusModel.status.profileConfigModalVisible = true;
  };

  const onLaunchButton = () => {
    profilesModel.saveProfile();
    keyboardConfigModel.writeConfigurationToDevice();
  };

  return {
    currentProfileName,
    allProfileNames,
    createProfile,
    loadProfile,
    saveProfile,
    renameProfile,
    copyProfile,
    deleteProfile,
    openConfiguration,
    onLaunchButton,
    profileSelectorSource: {
      options: allProfileNames.map(makePlainSelectorOption),
      choiceId: currentProfileName,
      setChoiceId: loadProfile,
    },
    isExportingPresetSelectionModalOpen: isPresetsModalOpen,
    openExportingPresetSelectionModal,
    closeExportingPresetSelectionModal,
    saveProfileAsPreset: profilesModel.exportProfileAsProjectPreset,
    currentProfileProjectId: editorModel.loadedPorfileData.projectId,
  };
}
