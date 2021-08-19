import { IProfileData } from '~/shared';
import { coreState } from '~/shell/global/CoreStateAction';

export const profilesReader = {
  getCurrentProfileProjectId(): string {
    return coreState.loadedProfileData?.projectId;
  },

  getCurrentProfile(): IProfileData | undefined {
    if (coreState.profileEditSource.type === 'NoEditProfileAvailable') {
      return undefined;
    }
    return coreState.loadedProfileData;
  },
};
