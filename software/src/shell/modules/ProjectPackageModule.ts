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
  async saveLocalProjectPackageInfo({ info }) {
    await projectPackageProvider.saveLocalProjectPackageInfo(info);
    const allProjectPackageInfos = produce(
      coreState.allProjectPackageInfos,
      (draft) => {
        const index = draft.findIndex(
          (it) => it.origin === info.origin && it.projectId === info.projectId,
        );
        if (index >= 0) {
          draft.splice(index, 1, info);
        } else {
          draft.push(info);
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
