import {
  globalSettingsDefault,
  IGlobalSettings,
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
};

export const defaultCoreState: ICoreState = {
  appVersion: '',
  allProjectPackageInfos: [],
  allCustomFirmwareInfos: [],
  globalSettings: globalSettingsDefault,
  deviceStatus: { isConnected: false },
};

export type ICoreAction = Partial<{
  loadAppVersion: 1;
  greet: { name: string; age: number };
  loadAllProjectPackages: 1;
  saveLocalProjectPackageInfo: { projectInfo: IProjectPackageInfo };
  loadAllCustomFirmwareInfos: 1;
  loadGlobalSettings: 1;
  writeGlobalSettings: { partialConfig: Partial<IGlobalSettings> };
}>;
