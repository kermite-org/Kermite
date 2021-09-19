import { IProfileEntry } from '~/shared';
import { uiReaders, uiState } from '~/ui/store';

export const profilesReader = {
  get profileEditSource() {
    return uiState.core.profileEditSource;
  },
  get allProfileEntries() {
    return uiState.core.allProfileEntries;
  },
  get visibleProfileEntries() {
    const { allProfileEntries } = uiState.core;
    const { globalProjectId } = uiReaders;
    if (globalProjectId) {
      return allProfileEntries.filter((it) => it.projectId === globalProjectId);
    } else {
      return allProfileEntries;
    }
  },
  get isEditProfileAvailable() {
    if (uiReaders.pagePath === '/assigner') {
      const { profileEditSource } = uiState.core;
      return profileEditSource.type !== 'NoEditProfileAvailable';
    } else {
      return true;
    }
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
