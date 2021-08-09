import { IProjectPackageInfo } from '~/shared';

type IUiGlobalStore = {
  allProjectPackageInfos: IProjectPackageInfo[];
};

export const uiGlobalStore: IUiGlobalStore = {
  allProjectPackageInfos: [],
};
