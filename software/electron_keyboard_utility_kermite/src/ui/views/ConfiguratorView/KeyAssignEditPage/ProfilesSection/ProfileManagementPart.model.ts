import { profilesModel } from '~ui/models';
import { callProfileSetupModal } from './ProfileSetupModal';
import {
  modalTextEdit,
  modalConfirm,
  modalAlert
} from '~ui/views/base/BasicModals';

export interface IProfileManagerViewModel {
  currentProfileName: string;
  allProfileNames: string[];
  createProfile(): void;
  loadProfile(name: string): void;
  saveProfile(): void;
  renameProfile(): void;
  copyProfile(): void;
  deleteProfile(): void;
}

export function makeProfileManagementViewModel(): IProfileManagerViewModel {
  const {
    currentProfileName,
    allProfileNames,
    loadProfile,
    saveProfile
  } = profilesModel;

  const checkValidNewProfileName = async (
    newProfileName: string
  ): Promise<boolean> => {
    if (!newProfileName.match(/^[^/./\\:*?"<>|]+$/)) {
      await modalAlert(
        `${newProfileName} is not for valid filename. operation cancelled.`
      );
      return false;
    }
    if (profilesModel.allProfileNames.includes(newProfileName)) {
      await modalAlert(
        `${newProfileName} is already exists. operation cancelled.`
      );
      return false;
    }
    return true;
  };

  const createProfile = async () => {
    const res = await callProfileSetupModal(undefined);
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    if (res && res.profileName && res.breedName) {
      const { profileName, breedName } = res;
      const nameValid = await checkValidNewProfileName(profileName);
      if (nameValid) {
        profilesModel.createProfile(profileName, breedName);
      }
    }
  };

  const inputNewProfileName = async (
    caption: string
  ): Promise<string | undefined> => {
    const newProfileName = await modalTextEdit({
      message: 'New Profile Name',
      defaultText: currentProfileName,
      caption
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
      caption: 'Delete Profile'
    });
    if (ok) {
      profilesModel.deleteProfile();
    }
  };

  return {
    currentProfileName,
    allProfileNames,
    createProfile,
    loadProfile,
    saveProfile,
    renameProfile,
    copyProfile,
    deleteProfile
  };
}
