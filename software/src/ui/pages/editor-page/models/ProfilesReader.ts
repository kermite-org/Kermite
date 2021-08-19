import { IProfileEntry } from '~/shared';
import { uiState } from '~/ui/commonStore/base';

export const profilesReader = {
  get profileEditSource() {
    return uiState.core.profileEditSource;
  },
  get allProfileEntries() {
    return uiState.core.allProfileEntries;
  },
  get visibleProfileEntries() {
    return uiState.core.visibleProfileEntries;
  },
  get isEditProfileAvailable() {
    const { profileEditSource } = uiState.core;
    return profileEditSource.type !== 'NoEditProfileAvailable';
  },
  get currentProfileEntry(): IProfileEntry | undefined {
    const { profileEditSource } = uiState.core;
    return (
      (profileEditSource.type === 'InternalProfile' &&
        profileEditSource.profileEntry) ||
      undefined
    );
  },
  get loadedProfileData() {
    return uiState.core.loadedProfileData;
  },
};
