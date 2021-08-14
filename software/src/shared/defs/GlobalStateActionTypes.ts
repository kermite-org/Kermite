import {
  fallbackKeyboardConfig,
  globalSettingsDefault,
  IGlobalSettings,
  IKeyboardConfig,
} from '~/shared/defs/ConfigTypes';
import {
  ICustomFirmwareInfo,
  IKeyboardDeviceStatus,
  IProjectPackageInfo,
} from '~/shared/defs/DomainTypes';

export type ICoreState = {
  appVersion: string;
  allProjectPackageInfos: IProjectPackageInfo[];
  allCustomFirmwareInfos: ICustomFirmwareInfo[];
  globalSettings: IGlobalSettings;
  deviceStatus: IKeyboardDeviceStatus;
  keyboardConfig: IKeyboardConfig;
};

export const defaultCoreState: ICoreState = {
  appVersion: '',
  allProjectPackageInfos: [],
  allCustomFirmwareInfos: [],
  globalSettings: globalSettingsDefault,
  deviceStatus: { isConnected: false },
  keyboardConfig: fallbackKeyboardConfig,
};

export type ICoreAction = Partial<{
  loadAppVersion: 1;
  greet: { name: string; age: number };
  loadAllProjectPackages: 1;
  saveLocalProjectPackageInfo: IProjectPackageInfo;
  loadAllCustomFirmwareInfos: 1;
  loadGlobalSettings: 1;
  writeGlobalSettings: Partial<IGlobalSettings>;
  loadKeyboardConfig: 1;
  writeKeyboardConfig: Partial<IKeyboardConfig>;
}>;
