import { IActionReceiver, ICoreAction } from '~/shared';
import { commitCoreState } from '~/shell/global';
import { projectPackageProvider } from '~/shell/projectPackages/ProjectPackageProvider';

export const projectPackageModule: IActionReceiver<ICoreAction> = {
  async loadAllProjectPackages() {
    const allProjectPackageInfos = await projectPackageProvider.getAllProjectPackageInfos();
    commitCoreState({ allProjectPackageInfos });
  },
};
