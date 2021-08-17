import { uiState } from '~/ui/commonStore/base';

export const profilesReader = {
  get editSource() {
    return uiState.core.profileManagerStatus.editSource;
  },
  get allProfileEntries() {
    return uiState.core.profileManagerStatus.allProfileEntries;
  },
  get isEditProfileAvailable() {
    const { editSource } = uiState.core.profileManagerStatus;
    return editSource.type !== 'NoProfilesAvailable';
  },
  get currentProfileName() {
    const { editSource } = uiState.core.profileManagerStatus;
    return (
      (editSource.type === 'InternalProfile' && editSource.profileName) || ''
    );
  },
};
