import { profilesModel } from '~ui2/models/zAppDomain';
import { profileSetupModal } from './ProfileSetupModal';
import { modalTextEdit, modalConfirm } from '~ui2/views/common/basicModals';

export function makeProfileManagementViewModel() {
  const {
    currentProfileName,
    allProfileNames,
    loadProfile,
    saveProfile
  } = profilesModel;

  const createProfile = async () => {
    const res = await profileSetupModal(undefined);
    if (!(res && res.newProfileName && res.breedName)) {
      return;
    }
    const { newProfileName, breedName } = res;
    if (allProfileNames.includes(newProfileName)) {
      alert(
        `Profile ${newProfileName} already exists. Please specify another name.`
      );
      return;
    }
    profilesModel.createProfile(newProfileName, breedName);
  };

  const renameProfile = async () => {
    const newProfileName = await modalTextEdit({
      message: 'input new profile name',
      defaultText: currentProfileName
    });
    if (!newProfileName) {
      return;
    }
    profilesModel.renameProfile(newProfileName);
  };

  const deleteProfile = async () => {
    const ok = await modalConfirm(
      `Profile ${currentProfileName} will be deleted. Are you sure?`
    );
    if (!ok) {
      return;
    }
    profilesModel.deleteProfile();
  };

  return {
    currentProfileName,
    allProfileNames,
    createProfile,
    loadProfile,
    saveProfile,
    renameProfile,
    deleteProfile
  };
}
