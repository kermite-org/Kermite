import {
  checkProfileEntryEquality,
  IProfileData,
  IProfileEntry,
  IProjectPackageInfo,
} from '~/shared';
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
  getVisibleProfiles(allProfiles: IProfileEntry[]): IProfileEntry[] {
    const { globalProjectId } = coreState.globalSettings;
    if (globalProjectId) {
      return allProfiles.filter((it) => it.projectId === globalProjectId);
    } else {
      return allProfiles;
    }
  },
  get visibleProfileEntries() {
    return profilesReader.getVisibleProfiles(coreState.allProfileEntries);
  },
  hasProfileEntry(profileEntry: IProfileEntry): boolean {
    return coreState.allProfileEntries.some((it) =>
      checkProfileEntryEquality(it, profileEntry),
    );
  },
  getCurrentInternalProfileEntry(): IProfileEntry | undefined {
    if (coreState.profileEditSource.type === 'InternalProfile') {
      return coreState.profileEditSource.profileEntry;
    }
  },
};

export const projectPackagesReader = {
  getLocalProjectInfo(projectId: string): IProjectPackageInfo | undefined {
    const projectInfos = coreState.allProjectPackageInfos;
    return projectInfos.find(
      (info) => info.origin === 'local' && info.projectId === projectId,
    );
  },
};
