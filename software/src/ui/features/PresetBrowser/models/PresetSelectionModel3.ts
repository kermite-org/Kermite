import { useEffect } from 'qx';
import {
  createProjectKey,
  fallbackProfileData,
  getOriginAndProjectIdFromProjectKey,
  IProfileData,
  IProjectPackageInfo,
  IResourceOrigin,
  IServerProfileInfo,
  ProfileDataConverter,
} from '~/shared';
import { appUi, ipcAgent, ISelectorOption, ISelectorSource } from '~/ui/base';
import {
  dispatchCoreAction,
  projectPackagesReader,
  uiActions,
  uiReaders,
  uiState,
} from '~/ui/store';

type IPresetType = 'projectLayout' | 'projectProfile' | 'userProfile';

type IPresetSelectionModel = {
  projectSelectorSource: ISelectorSource;
  presetSelectorSource: ISelectorSource;
  loadedProfileData: IProfileData;
  createProfile(): void;
  canSelectProject: boolean;
};

type IProjectItem = {
  projectKey: string; // online#${projectId} |  local#${projectId}
  origin: IResourceOrigin;
  keyboardName: string;
};

type IPresetItem = {
  presetKey: string; // projectLayout#${layoutName} | projectProfile#${profileName}
  presetType: 'projectLayout' | 'projectProfile';
  displayName: string;
};

type IUserProfileItem = {
  presetKey: string; // userProfile#${profileId}
  presetType: 'userProfile';
  profileName: string;
  userName: string;
  profileData: IProfileData;
};

type IState = {
  allProjectItems: IProjectItem[];
  projectPresetItems: IPresetItem[];
  userProfileItems: IUserProfileItem[];
  currentProjectKey: string;
  currentPresetKey: string;
  loadedProfileData: IProfileData;
};

const state: IState = {
  allProjectItems: [],
  projectPresetItems: [],
  userProfileItems: [],
  currentProjectKey: '',
  currentPresetKey: '',
  loadedProfileData: fallbackProfileData,
};

const helpers = {
  createPresetKey(presetType: string, signifier: string): string {
    return `${presetType}#${signifier}`;
  },
  decodePresetKey(presetKey: string): {
    presetType: IPresetType;
    presetSignifier: string;
  } {
    const presetSlice = presetKey.split('#');
    const presetType = presetSlice[0] as IPresetType;
    const presetSignifier = presetSlice[1];
    return { presetType, presetSignifier };
  },
  createProjectItems(projectInfos: IProjectPackageInfo[]): IProjectItem[] {
    return projectInfos
      .filter((it) => it.layouts.length > 0 || it.profiles.length > 0)
      .map((it) => ({
        projectKey: createProjectKey(it.origin, it.projectId),
        origin: it.origin,
        keyboardName: it.keyboardName,
      }));
  },
  createProjectPresetItems(projectInfo: IProjectPackageInfo): IPresetItem[] {
    return [
      ...projectInfo.layouts.map((layout) => ({
        presetKey: helpers.createPresetKey('projectLayout', layout.layoutName),
        presetType: 'projectLayout' as const,
        displayName: layout.layoutName,
      })),
      ...projectInfo.profiles.map((profile) => ({
        presetKey: helpers.createPresetKey(
          'projectProfile',
          profile.profileName,
        ),
        presetType: 'projectProfile' as const,
        displayName: profile.profileName,
      })),
    ];
  },
  createUserProfileItem(profile: IServerProfileInfo): IUserProfileItem {
    return {
      presetKey: helpers.createPresetKey('userProfile', profile.id),
      presetType: 'userProfile',
      profileName: profile.profileName,
      userName: profile.userName,
      profileData: profile.profileData,
    };
  },
  createProjectSelectorOption(item: IProjectItem): ISelectorOption {
    const prefix = (item.origin === 'local' && '(local) ') || '';
    return {
      value: item.projectKey,
      label: `${prefix}${item.keyboardName}`,
    };
  },
  createPresetSelectorOption(item: IPresetItem): ISelectorOption {
    return {
      value: item.presetKey,
      label: `(${item.presetType}) ${item.displayName}`,
    };
  },
  createUserProfileSelectorOption(item: IUserProfileItem): ISelectorOption {
    return {
      value: item.presetKey,
      label: `(${item.presetType}) ${item.profileName} (by ${item.userName})`,
    };
  },
  getProjectPresetProfileDataFromProjectInfo(
    projectInfo: IProjectPackageInfo,
    presetKey: string,
  ): IProfileData | undefined {
    const { presetType, presetSignifier } = helpers.decodePresetKey(presetKey);
    if (presetType === 'projectLayout') {
      const layout = projectInfo.layouts.find(
        (layout) => layout.layoutName === presetSignifier,
      );
      if (layout) {
        return { ...fallbackProfileData, keyboardDesign: layout.data };
      }
    } else if (presetType === 'projectProfile') {
      const profile = projectInfo.profiles.find(
        (profile) => profile.profileName === presetSignifier,
      );
      if (profile) {
        return ProfileDataConverter.convertProfileDataFromPersist(profile.data);
      }
    }
  },
  async fetchKermiteServerProfiles(
    projectId: string,
  ): Promise<IServerProfileInfo[]> {
    if (uiState.core.kermiteServerProjectIds.includes(projectId)) {
      return await ipcAgent.async.presetHub_getServerProfiles(projectId);
    } else {
      return [];
    }
  },
};

const loaders = {
  loadProfileData(projectKey: string, presetKey: string): IProfileData {
    if (projectKey && presetKey) {
      const { presetType } = helpers.decodePresetKey(presetKey);
      if (presetType === 'projectLayout' || presetType === 'projectProfile') {
        const projectInfo =
          projectPackagesReader.findProjectInfoByProjectKey(projectKey);
        if (projectInfo) {
          const profileData =
            helpers.getProjectPresetProfileDataFromProjectInfo(
              projectInfo,
              presetKey,
            );
          if (profileData) {
            return profileData;
          }
        }
      }
      if (presetType === 'userProfile') {
        const profileItem = state.userProfileItems.find(
          (it) => it.presetKey === presetKey,
        );
        if (profileItem) {
          return profileItem.profileData;
        }
      }
    }
    return fallbackProfileData;
  },
};

const actions = {
  updatePreviewProfileData() {
    const { currentProjectKey, currentPresetKey } = state;
    state.loadedProfileData = loaders.loadProfileData(
      currentProjectKey,
      currentPresetKey,
    );
  },
  setProjectKey(projectKey: string) {
    state.currentProjectKey = projectKey;
    const projectInfo =
      projectPackagesReader.findProjectInfoByProjectKey(projectKey);
    if (projectInfo) {
      state.projectPresetItems = helpers.createProjectPresetItems(projectInfo);
      state.currentPresetKey = state.projectPresetItems[0]?.presetKey || '';
      const { projectId } = getOriginAndProjectIdFromProjectKey(projectKey);
      helpers.fetchKermiteServerProfiles(projectId).then((userProfiles) => {
        state.userProfileItems = userProfiles.map(
          helpers.createUserProfileItem,
        );
        appUi.rerender();
      });
    }
    actions.updatePreviewProfileData();
  },
  setPresetKey(presetKey: string) {
    state.currentPresetKey = presetKey;
    actions.updatePreviewProfileData();
  },
  initialize() {
    state.allProjectItems = helpers.createProjectItems(
      uiReaders.allProjectPackageInfos,
    );
    const { globalProjectKey } = uiReaders;
    if (globalProjectKey) {
      actions.setProjectKey(globalProjectKey);
    } else {
      actions.setProjectKey(state.allProjectItems[0]?.projectKey || '');
    }
  },
  async createProfile() {
    await dispatchCoreAction({
      profile_createProfileExternal: { profileData: state.loadedProfileData },
    });
    uiActions.navigateTo('/assigner');
  },
};

export function usePresetSelectionModel3(): IPresetSelectionModel {
  useEffect(actions.initialize, []);

  const {
    allProjectItems,
    projectPresetItems,
    userProfileItems,
    currentProjectKey,
    currentPresetKey,
    loadedProfileData,
  } = state;

  const { setProjectKey, setPresetKey, createProfile } = actions;

  const canSelectProject = uiReaders.globalProjectKey === '';

  const projectSelectorSource: ISelectorSource = {
    options: allProjectItems.map(helpers.createProjectSelectorOption),
    value: currentProjectKey,
    setValue: setProjectKey,
  };

  const presetSelectorSource: ISelectorSource = {
    options: [
      ...projectPresetItems.map(helpers.createPresetSelectorOption),
      ...userProfileItems.map(helpers.createUserProfileSelectorOption),
    ],
    value: currentPresetKey,
    setValue: setPresetKey,
  };

  return {
    projectSelectorSource,
    presetSelectorSource,
    loadedProfileData,
    createProfile,
    canSelectProject,
  };
}
