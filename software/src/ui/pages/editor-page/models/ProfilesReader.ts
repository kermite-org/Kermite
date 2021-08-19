import { IProfileEntry } from '~/shared';
import { uiState } from '~/ui/commonStore/base';

export const profilesReader = {
  get profileEditSource() {
    return uiState.core.profileManagerStatus.profileEditSource;
  },
  get allProfileEntries() {
    return uiState.core.profileManagerStatus.allProfileEntries;
  },
  get visibleProfileEntries() {
    return uiState.core.profileManagerStatus.visibleProfileEntries;
  },
  get isEditProfileAvailable() {
    const { profileEditSource } = uiState.core.profileManagerStatus;
    return profileEditSource.type !== 'NoEditProfileAvailable';
  },
  get currentProfileEntry(): IProfileEntry | undefined {
    const { profileEditSource } = uiState.core.profileManagerStatus;
    return (
      (profileEditSource.type === 'InternalProfile' &&
        profileEditSource.profileEntry) ||
      undefined
    );
  },
};
