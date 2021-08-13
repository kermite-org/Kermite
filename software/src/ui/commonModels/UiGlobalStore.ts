import { ICustomFirmwareInfo, IProjectPackageInfo } from '~/shared';
import { IPageSpec } from '~/ui/commonModels/PageTypes';

type IUiGlobalStore = {
  pageSpec: IPageSpec | undefined;
  allProjectPackageInfos: IProjectPackageInfo[];
  allCustomFirmwareInfos: ICustomFirmwareInfo[];
};

export const uiGlobalStore: IUiGlobalStore = {
  pageSpec: undefined,
  allProjectPackageInfos: [],
  allCustomFirmwareInfos: [],
};
