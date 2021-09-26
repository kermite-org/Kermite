import { IGlobalProjectSpec } from '~/shared';
import { router } from '~/ui/base';
import {
  IPageModelSpec,
  IPageSpec,
  PagePaths,
} from '~/ui/commonModels/PageTypes';
import { globalSettingsWriter } from '~/ui/store/base/GlobalSettings';
import { commitUiSettings, commitUiState } from '~/ui/store/base/UiState';

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
    commitUiSettings({ showSetupNavigationPanel: true });
  },
  closeSetupNavigationPanel() {
    commitUiSettings({ showSetupNavigationPanel: false });
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
