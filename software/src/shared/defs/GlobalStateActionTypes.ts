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
  IProfileManagerStatus,
  IProjectPackageInfo,
} from '~/shared/defs/DomainTypes';
import { fallbackProfileData } from '~/shared/defs/ProfileData';

export type ICoreState = {
  applicationVersionInfo: IApplicationVersionInfo;
  allProjectPackageInfos: IProjectPackageInfo[];
  allCustomFirmwareInfos: ICustomFirmwareInfo[];
  globalSettings: IGlobalSettings;
  keyboardConfig: IKeyboardConfig;
  deviceStatus: IKeyboardDeviceStatus;
  deviceSelectionStatus: IDeviceSelectionStatus;
  appWindowStatus: IAppWindowStatus;
  profileManagerStatus: IProfileManagerStatus;
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

const defaultProfileManagerStatus: IProfileManagerStatus = {
  editSource: {
    type: 'NoProfilesAvailable',
  },
  loadedProfileData: fallbackProfileData,
  allProfileEntries: [],
  visibleProfileEntries: [],
};

export const defaultCoreState: ICoreState = {
  applicationVersionInfo: defaultApplicationVersionInfo,
  allProjectPackageInfos: [],
  allCustomFirmwareInfos: [],
  globalSettings: globalSettingsDefault,
  keyboardConfig: fallbackKeyboardConfig,
  deviceStatus: { isConnected: false },
  deviceSelectionStatus: fallbackDeviceSelectionStatus,
  appWindowStatus: defaultAppWindowStatus,
  profileManagerStatus: defaultProfileManagerStatus,
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
}>;
