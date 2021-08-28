import { IProjectPackageInfo } from '~/shared';
import { router } from '~/ui/base';
import { onboardingPanelDisplayStateModel } from '~/ui/commonModels';
import { globalSettingsWriter, uiState } from '~/ui/commonStore';

export const uiReaders = {
  get pagePath() {
    return router.getPagePath();
  },
  get globalProjectId() {
    return uiState.core.globalSettings.globalProjectId;
  },
  get useLocalResources() {
    return uiState.core.globalSettings.useLocalResources;
  },
  get allProjectPackageInfos(): IProjectPackageInfo[] {
    return uiState.core.allProjectPackageInfos;
  },
};

export const uiActions = {
  navigateTo(pagePath: string) {
    router.navigateTo(pagePath);
  },
  closeOnboardingPanel() {
    onboardingPanelDisplayStateModel.close();
  },
  setGlobalProjectId(id: string) {
    globalSettingsWriter.writeValue('globalProjectId', id);
  },
};
