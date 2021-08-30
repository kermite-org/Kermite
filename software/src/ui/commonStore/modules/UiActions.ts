import { IGlobalProjectSpec } from '~/shared';
import { router } from '~/ui/base';
import { onboardingPanelDisplayStateModel } from '~/ui/commonModels';
import { globalSettingsWriter } from '~/ui/commonStore/modules/GlobalSettings';

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
