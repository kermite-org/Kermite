import {
  globalSettingsDefault,
  IGlobalSettings,
} from '~/shared/defs/ConfigTypes';
import {
  ICustomFirmwareInfo,
  IProjectPackageInfo,
} from '~/shared/defs/DomainTypes';
import { cloneObject } from '~/shared/funcs/Utils';

export type ICoreState = {
  appVersion: string;
  allProjectPackageInfos: IProjectPackageInfo[];
  allCustomFirmwareInfos: ICustomFirmwareInfo[];
  globalSettings: IGlobalSettings;
};

export type IUiState = {
  core: ICoreState;
};

export const defaultCoreState: ICoreState = {
  appVersion: '',
  allProjectPackageInfos: [],
  allCustomFirmwareInfos: [],
  globalSettings: globalSettingsDefault,
};

export const defaultUiState: IUiState = cloneObject({
  core: defaultCoreState,
});

export type ICoreAction = Partial<{
  loadAppVersion: 1;
  greet: { name: string; age: number };
  loadAllProjectPackages: 1;
  saveLocalProjectPackageInfo: { projectInfo: IProjectPackageInfo };
  loadAllCustomFirmwareInfos: 1;
  loadGlobalSettings: 1;
  writeGlobalSettings: { partialConfig: Partial<IGlobalSettings> };
}>;

export type IUiAction = Partial<{}>;
