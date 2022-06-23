import {
  checkProfileEntryEquality,
  IProfileData,
  IProfileEntry,
  IProjectPackageInfo,
} from '~/shared';
import { appEnv } from '~/shell/base';
import { pathResolve } from '~/shell/funcs';
import { coreState } from '~/shell/modules/core/coreStateAction';

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
    const { globalProjectSpec } = coreState.globalSettings;
    if (globalProjectSpec) {
      return allProfiles.filter(
        (it) => it.projectId === globalProjectSpec.projectId,
      );
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

export const globalSettingsReader = {
  getLocalRepositoryDir(): string | undefined {
    const settings = coreState.globalSettings;
    if (settings.developerMode && settings.useLocalResources) {
      if (appEnv.isDevelopment) {
        return pathResolve('../');
      } else {
        return settings.localProjectRootFolderPath;
      }
    }
    return undefined;
  },
};
