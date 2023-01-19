import { IGlobalProjectSpec } from '~/shared';
import { router } from '~/ui/base';
import {
  IPageModelSpec,
  IPageSpec,
  PagePaths,
} from '~/ui/commonModels/pageTypes';
import { profileSetupStore } from '~/ui/features/profileSetupWizard/store/profileSetupStore';
import { globalSettingsWriter } from '~/ui/store/base/globalSettings';
import { commitUiSettings, commitUiState } from '~/ui/store/base/uiState';

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
  closeSubPage() {
    commitUiState({ pageSpec: undefined });
  },
  openPageModal(pageModalSpec: IPageModelSpec) {
    commitUiState({ pageModalSpec });
  },
  closePageModal() {
    commitUiState({ pageModalSpec: undefined });
  },
  openSetupNavigationPanel() {
    throw new Error('deprecated');
    // commitUiSettings({ showSetupNavigationPanel: true });
  },
  closeSetupNavigationPanel() {
    throw new Error('deprecated');
    // commitUiSettings({ showSetupNavigationPanel: false });
  },
  showProfileSetupWizard() {
    profileSetupStore.actions.clearPersistState();
    uiActions.navigateTo('/profileSetup/step1');
  },
  showProjectQuickSetupWizard() {
    uiActions.navigateTo('/projectQuickSetup/step1');
  },
  showExternalFirmwareProjectSetupWizard() {
    uiActions.navigateTo('/externalFirmwareProjectSetup/step1');
  },
  setGlobalProjectSpec(spec: IGlobalProjectSpec) {
    globalSettingsWriter.writeValue('globalProjectSpec', spec);
  },
  stopLiveMode() {
    commitUiSettings({ showLayersDynamic: false });
  },
  setLoading() {
    commitUiState({ isLoading: true });
  },
  clearLoading() {
    commitUiState({ isLoading: false });
  },
};
