import {
  fallbackKeyboardConfig,
  globalSettingsDefault,
  IGlobalSettings,
  IKeyboardConfig,
} from '~/shared/defs/ConfigTypes';
import {
  fallbackDeviceSelectionStatus,
  IApplicationVersionInfo,
  IAppWindowStatus,
  ICustomFirmwareInfo,
  IDeviceSelectionStatus,
  IKeyboardDeviceStatus,
  ILayoutEditSource,
  IPresetSpec,
  IProfileEditSource,
  IProfileEntry,
  IProjectPackageInfo,
  IResourceOrigin,
} from '~/shared/defs/DomainTypes';
import {
  createFallbackPersistKeyboardDesign,
  IPersistKeyboardDesign,
} from '~/shared/defs/KeyboardDesign';
import { fallbackProfileData, IProfileData } from '~/shared/defs/ProfileData';

export type ICoreState = {
  applicationVersionInfo: IApplicationVersionInfo;
  allProjectPackageInfos: IProjectPackageInfo[];
  allCustomFirmwareInfos: ICustomFirmwareInfo[];
  globalSettings: IGlobalSettings;
  keyboardConfig: IKeyboardConfig;
  deviceStatus: IKeyboardDeviceStatus;
  deviceSelectionStatus: IDeviceSelectionStatus;
  appWindowStatus: IAppWindowStatus;
  // profile
  allProfileEntries: IProfileEntry[];
  profileEditSource: IProfileEditSource;
  loadedProfileData: IProfileData;
  editProfileData: IProfileData;
  // layout
  layoutEditSource: ILayoutEditSource;
  loadedLayoutData: IPersistKeyboardDesign;
};

const defaultApplicationVersionInfo: IApplicationVersionInfo = {
  version: '',
};

const defaultAppWindowStatus: IAppWindowStatus = {
  isActive: false,
  isDevtoolsVisible: false,
  isMaximized: false,
  isWidgetAlwaysOnTop: false,
};

const defaultProfileEditSource: IProfileEditSource = {
  type: 'NoEditProfileAvailable',
};

const fallbackLayoutEditSource: ILayoutEditSource = {
  type: 'LayoutNewlyCreated',
};

// const defaultProfileManagerStatus: IProfileManagerStatus = {
//   profileEditSource: {
//     type: 'NoEditProfileAvailable',
//   },
//   loadedProfileData: fallbackProfileData,
//   allProfileEntries: [],
//   visibleProfileEntries: [],
// };

export const defaultCoreState: ICoreState = {
  applicationVersionInfo: defaultApplicationVersionInfo,
  allProjectPackageInfos: [],
  allCustomFirmwareInfos: [],
  globalSettings: globalSettingsDefault,
  keyboardConfig: fallbackKeyboardConfig,
  deviceStatus: { isConnected: false },
  deviceSelectionStatus: fallbackDeviceSelectionStatus,
  appWindowStatus: defaultAppWindowStatus,
  allProfileEntries: [],
  profileEditSource: defaultProfileEditSource,
  loadedProfileData: fallbackProfileData,
  editProfileData: fallbackProfileData,
  layoutEditSource: fallbackLayoutEditSource,
  loadedLayoutData: createFallbackPersistKeyboardDesign(),
};

export type ICoreAction = Partial<{
  project_loadAllProjectPackages: 1;
  project_saveLocalProjectPackageInfo: IProjectPackageInfo;
  project_loadAllCustomFirmwareInfos: 1;

  config_loadGlobalSettings: 1;
  config_writeGlobalSettings: Partial<IGlobalSettings>;
  config_loadKeyboardConfig: 1;
  config_writeKeyboardConfig: Partial<IKeyboardConfig>;

  window_closeWindow: 1;
  window_minimizeWindow: 1;
  window_maximizeWindow: 1;
  window_restartApplication: 1;
  window_setDevToolVisibility: boolean;
  window_setWidgetAlwaysOnTop: boolean;
  window_reloadPage: 1;

  profile_createProfile: {
    newProfileName: string;
    targetProjectOrigin: IResourceOrigin;
    targetProjectId: string;
    presetSpec: IPresetSpec;
  };
  profile_createProfileUnnamed: {
    targetProjectOrigin: IResourceOrigin;
    targetProjectId: string;
    presetSpec: IPresetSpec;
  };
  profile_createProfileExternal: {
    profileData: IProfileData;
  };
  profile_createProfileFromLayout: {
    projectId: string;
    layout: IPersistKeyboardDesign;
  };
  profile_loadProfile: { profileEntry: IProfileEntry };
  profile_saveCurrentProfile: { profileData: IProfileData };
  profile_copyProfile: { newProfileName: string };
  profile_renameProfile: { newProfileName: string };
  profile_deleteProfile: 1;

  profile_saveProfileAs: { profileData: IProfileData; newProfileName: string };
  profile_saveAsProjectPreset: {
    projectId: string;
    presetName: string;
    profileData: IProfileData;
  };
  profile_importFromFile: { filePath: string };
  profile_exportToFile: { filePath: string; profileData: IProfileData };
  profile_openUserProfilesFolder: 1;
  profile_setEditProfileData: { editProfileData: IProfileData };
}>;
