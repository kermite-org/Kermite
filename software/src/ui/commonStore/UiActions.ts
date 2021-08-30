import { IGlobalProjectSpec } from '~/shared';
import { router } from '~/ui/base';
import { IPageSpec, PagePaths } from '~/ui/commonModels/PageTypes';
import { onboardingPanelDisplayStateModel } from '~/ui/commonModels/UiStatusModel';
import { globalSettingsWriter } from '~/ui/commonStore/GlobalSettings';
import { commitUiState } from '~/ui/commonStore/base';

export const uiActions = {
  navigateTo(pageSpecOrPagePath: IPageSpec | PagePaths) {
    if (typeof pageSpecOrPagePath === 'string') {
      const pagePath = pageSpecOrPagePath;
      router.navigateTo(pagePath);
      commitUiState({ pageSpec: undefined });
    } else {
      const pageSpec = pageSpecOrPagePath;
      commitUiState({ pageSpec });
    }
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
