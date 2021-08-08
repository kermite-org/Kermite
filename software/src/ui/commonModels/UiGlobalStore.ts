import { IProjectPackageInfo } from '~/shared';

export const uiGlobalStore = new (class {
  allProjectPackageInfos: IProjectPackageInfo[] = [];
})();
