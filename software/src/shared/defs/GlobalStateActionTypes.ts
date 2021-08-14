import {
  ICustomFirmwareInfo,
  IProjectPackageInfo,
} from '~/shared/defs/DomainTypes';
import { cloneObject } from '~/shared/funcs/Utils';

export type ICoreState = {
  appVersion: string;
  allProjectPackageInfos: IProjectPackageInfo[];
  allCustomFirmwareInfos: ICustomFirmwareInfo[];
};

export type IUiState = {
  core: ICoreState;
};

export const defaultCoreState: ICoreState = {
  appVersion: '',
  allProjectPackageInfos: [],
  allCustomFirmwareInfos: [],
};

export const defaultUiState: IUiState = cloneObject({
  core: defaultCoreState,
});

export type ICoreAction = Partial<{
  loadAppVersion?: 1;
  greet: { name: string; age: number };
  loadAllProjectPackages: 1;
  saveLocalProjectPackageInfo: { projectInfo: IProjectPackageInfo };
  loadAllCustomFirmwareInfos: 1;
}>;

export type IUiAction = Partial<{}>;
