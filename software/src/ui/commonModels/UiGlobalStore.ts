import { IProjectPackageInfo } from '~/shared';
import { globalSettingsModel } from '~/ui/commonModels/GlobalSettingsModel';

type IUiGlobalStore = {
  allProjectPackageInfos: IProjectPackageInfo[];
};

export const uiGlobalStore: IUiGlobalStore = {
  allProjectPackageInfos: [],
};

export const uiGlobalStoreReader = {
  getProjectInfosGlobalProjectSelectionAffected(): IProjectPackageInfo[] {
    const {
      useLocalResouces,
      globalProjectId,
    } = globalSettingsModel.globalSettings;

    return uiGlobalStore.allProjectPackageInfos
      .filter((info) => useLocalResouces || info.origin === 'online')
      .filter(
        (info) => globalProjectId === '' || info.projectId === globalProjectId,
      );
  },
  getEditTargetProject(): IProjectPackageInfo | undefined {
    const { globalProjectId } = globalSettingsModel.globalSettings;
    return uiGlobalStore.allProjectPackageInfos.find(
      (info) => info.origin === 'local' && info.projectId === globalProjectId,
    );
  },
};
