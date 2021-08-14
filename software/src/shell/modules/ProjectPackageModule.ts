import produce from 'immer';
import { IActionReceiver, ICoreAction } from '~/shared';
import { commitCoreState, coreState } from '~/shell/global';
import { ProjectPackageProvider } from '~/shell/projectPackages/ProjectPackageProvider';

const projectPackageProvider = new ProjectPackageProvider();

export const projectPackageModule: IActionReceiver<ICoreAction> = {
  async loadAllProjectPackages() {
    const allProjectPackageInfos = await projectPackageProvider.getAllProjectPackageInfos();
    commitCoreState({ allProjectPackageInfos });
  },
  async saveLocalProjectPackageInfo(projectInfo) {
    await projectPackageProvider.saveLocalProjectPackageInfo(projectInfo);
    const allProjectPackageInfos = produce(
      coreState.allProjectPackageInfos,
      (draft) => {
        const index = draft.findIndex((it) => it.sig === projectInfo.sig);
        if (index >= 0) {
          draft.splice(index, 1, projectInfo);
        } else {
          draft.push(projectInfo);
        }
      },
    );
    commitCoreState({ allProjectPackageInfos });
  },
  async loadAllCustomFirmwareInfos() {
    const allCustomFirmwareInfos = await projectPackageProvider.getAllCustomFirmwareInfos();
    commitCoreState({ allCustomFirmwareInfos });
  },
};
