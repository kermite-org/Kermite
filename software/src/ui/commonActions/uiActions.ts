import {
  createProjectSig,
  IGlobalProjectSpec,
  IProjectPackageInfo,
} from '~/shared';
import { router } from '~/ui/base';
import { onboardingPanelDisplayStateModel } from '~/ui/commonModels';
import { globalSettingsWriter, uiState } from '~/ui/commonStore';

export const uiReaders = {
  get pagePath() {
    return router.getPagePath();
  },
  get isGlobalProjectSelected() {
    return !!uiState.core.globalSettings.globalProjectSpec;
  },
  get globalProjectId() {
    return uiState.core.globalSettings.globalProjectSpec?.projectId;
  },
  get globalProjectOrigin() {
    return uiState.core.globalSettings.globalProjectSpec?.origin;
  },
  get globalProjectKey(): string {
    const { globalProjectSpec } = uiState.core.globalSettings;
    return (
      (globalProjectSpec &&
        createProjectSig(
          globalProjectSpec.origin,
          globalProjectSpec.projectId,
        )) ||
      ''
    );
  },
  get isDeveloperMode() {
    return uiState.core.globalSettings.developerMode;
  },
  get allProjectPackageInfos(): IProjectPackageInfo[] {
    return uiState.core.allProjectPackageInfos;
  },
};

export const uiActions = {
  navigateTo(pagePath: string) {
    router.navigateTo(pagePath);
  },
  openOnboardingPanel() {
    onboardingPanelDisplayStateModel.open();
  },
  closeOnboardingPanel() {
    onboardingPanelDisplayStateModel.close();
  },
  setGlobalProjectSpec(spec: IGlobalProjectSpec) {
    globalSettingsWriter.writeValue('globalProjectSpec', spec);
  },
};
