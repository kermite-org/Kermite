import {
  modalAlert,
  modalTextEdit,
  modalConfirm,
} from '@ui-root/base/dialog/BasicModals';
import { models } from '@ui-root/models';
import { makePlainSelectorOption } from '@ui-root/viewModels/viewModelHelpers';
import { ISelectorSource } from '@ui-root/viewModels/viewModelInterfaces';
import { callProfileSetupModal } from '@ui-root/views/modals/ProfileSetupModal';

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
}

export function makeProfileManagementPartViewModel(): IProfileManagementPartViewModel {
  const {
    currentProfileName,
    allProfileNames,
    loadProfile,
    saveProfile,
  } = models.profilesModel;

  const checkValidNewProfileName = async (
    newProfileName: string,
  ): Promise<boolean> => {
    if (!newProfileName.match(/^[^/./\\:*?"<>|]+$/)) {
      await modalAlert(
        `${newProfileName} is not for valid filename. operation cancelled.`,
      );
      return false;
    }
    if (models.profilesModel.allProfileNames.includes(newProfileName)) {
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
    if (res && res.profileName && res.targetProjectId && res.presetName) {
      const { profileName, targetProjectId, presetName } = res;
      const nameValid = await checkValidNewProfileName(profileName);
      if (nameValid) {
        models.profilesModel.createProfile(
          profileName,
          targetProjectId,
          presetName,
        );
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
      models.profilesModel.renameProfile(newProfileName);
    }
  };

  const copyProfile = async () => {
    const newProfileName = await inputNewProfileName('Copy Profile');
    if (newProfileName) {
      models.profilesModel.copyProfile(newProfileName);
    }
  };

  const deleteProfile = async () => {
    const ok = await modalConfirm({
      message: `Profile ${currentProfileName} will be deleted. Are you sure?`,
      caption: 'Delete Profile',
    });
    if (ok) {
      models.profilesModel.deleteProfile();
    }
  };

  const openConfiguration = () => {
    models.uiStatusModel.status.profileConfigModalVisible = true;
  };

  const onLaunchButton = () => {
    models.profilesModel.saveProfile();
    models.keyboardConfigModel.writeConfigurationToDevice();
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
  };
}
