import { router } from '~/ui/base';
import { IPageSpec, PagePaths } from '~/ui/commonModels/PageTypes';
import { uiGlobalStore } from '~/ui/commonModels/UiGlobalStore';

export const pageActions = {
  navigateTo(pageSpecOrPagePath: IPageSpec | PagePaths) {
    if (typeof pageSpecOrPagePath === 'string') {
      const pagePath = pageSpecOrPagePath;
      router.navigateTo(pagePath);
      uiGlobalStore.pageSpec = undefined;
    } else {
      const pageSpec = pageSpecOrPagePath;
      uiGlobalStore.pageSpec = pageSpec;
    }
  },
};
