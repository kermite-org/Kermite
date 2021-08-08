import { IProjectPackageInfo } from '~/shared';
import { globalSettingsModel } from '~/ui/commonModels/GlobalSettingsModel';

type IUiGlobalStore = {
  allProjectPackageInfos: IProjectPackageInfo[];
};

export const uiGlobalStore: IUiGlobalStore = {
  allProjectPackageInfos: [],
};

export const uiGlobalStoreReader = {
  getProjectInfosGlobalProjectSelectionAffected() {
    const { globalProjectId } = globalSettingsModel.globalSettings;
    return uiGlobalStore.allProjectPackageInfos.filter(
      (info) => globalProjectId === '' || info.projectId === globalProjectId,
    );
  },
};
