import { IProfileEntry } from '~/shared';
import { uiState } from '~/ui/commonStore/base';

export const profilesReader = {
  get editSource() {
    return uiState.core.profileManagerStatus.editSource;
  },
  get allProfileEntries() {
    return uiState.core.profileManagerStatus.allProfileEntries;
  },
  get visibleProfileEntries() {
    return uiState.core.profileManagerStatus.visibleProfileEntries;
  },
  get isEditProfileAvailable() {
    const { editSource } = uiState.core.profileManagerStatus;
    return editSource.type !== 'NoEditProfileAvailable';
  },
  get currentProfileEntry(): IProfileEntry | undefined {
    const { editSource } = uiState.core.profileManagerStatus;
    return (
      (editSource.type === 'InternalProfile' && editSource.profileEntry) ||
      undefined
    );
  },
};
