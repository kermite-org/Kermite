import { router } from '~/ui/base';
import { IPageSpec, PagePaths } from '~/ui/commonModels/PageTypes';
import { commitUiState } from '~/ui/commonModels/UiState';

export const pageActions = {
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
};
