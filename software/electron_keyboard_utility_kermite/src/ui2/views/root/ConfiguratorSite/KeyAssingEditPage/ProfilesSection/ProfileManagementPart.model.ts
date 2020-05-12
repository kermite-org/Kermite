import { profilesModel } from '~ui2/models/zAppDomain';
import { profileSetupModal } from './ProfileSetupModal';
import {
  modalTextEdit,
  modalConfirm,
  modalAlert
} from '~ui2/views/common/basicModals';

export function makeProfileManagementViewModel() {
  const {
    currentProfileName,
    allProfileNames,
    loadProfile,
    saveProfile
  } = profilesModel;

  const checkValidNewProfileName = async (
    newProfileName: string
  ): Promise<boolean> => {
    if (!newProfileName.match(/^[^/./\\:*?\"<>|]+$/)) {
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
    const res = await profileSetupModal(undefined);
    if (res && res.newProfileName && res.breedName) {
      const { newProfileName, breedName } = res;
      const nameValid = await checkValidNewProfileName(newProfileName);
      if (nameValid) {
        profilesModel.createProfile(newProfileName, breedName);
      }
    }
  };

  const inputNewProfileName = async (): Promise<string | undefined> => {
    const newProfileName = await modalTextEdit({
      message: 'input new profile name',
      defaultText: currentProfileName
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
    const newProfileName = await inputNewProfileName();
    if (newProfileName) {
      profilesModel.renameProfile(newProfileName);
    }
  };

  const copyProfile = async () => {
    const newProfileName = await inputNewProfileName();
    if (newProfileName) {
      profilesModel.copyProfile(newProfileName);
    }
  };

  const deleteProfile = async () => {
    const ok = await modalConfirm(
      `Profile ${currentProfileName} will be deleted. Are you sure?`
    );
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
