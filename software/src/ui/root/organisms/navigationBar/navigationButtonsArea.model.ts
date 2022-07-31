import { texts } from '~/ui/base';
import { PagePaths } from '~/ui/commonModels';
import { uiActions, uiReaders } from '~/ui/store';

export interface NavigationItemModel {
  pagePath: PagePaths;
  pageName: string;
  iconSpec: string;
  isCurrent: boolean;
  onClick: () => void;
  hint: string;
}

export interface NavigationBarModel {
  navigationItems: NavigationItemModel[];
}

interface NavigationItemSource {
  pagePath: PagePaths;
  pageName: string;
  iconSpec: string;
  hint: string;
  isAvailable?: () => boolean;
}

const itemsSource: NavigationItemSource[] = [
  {
    pagePath: '/assigner',
    pageName: texts.sideMenuApps.assigner,
    iconSpec: 'fa fa-keyboard',
    hint: texts.sideMenuAppsHint.assigner,
  },
  {
    pagePath: '/layoutEditor',
    pageName: texts.sideMenuApps.layoutEditor,
    iconSpec: 'fa fa-drafting-compass',
    hint: texts.sideMenuAppsHint.layoutEditor,
  },
  {
    pagePath: '/presetBrowser',
    pageName: texts.sideMenuApps.presetBrowser,
    iconSpec: 'fa fa-book',
    hint: texts.sideMenuAppsHint.presetBrowser,
  },
  {
    pagePath: '/shapePreview',
    pageName: texts.sideMenuApps.shapePreview,
    iconSpec: 'fa fa-file-code',
    hint: texts.sideMenuAppsHint.shapePreview,
    // isAvailable: () => appUi.isDevelopment && uiReaders.isDeveloperMode,
    isAvailable: () => false,
  },
  {
    pagePath: '/projectReview',
    pageName: 'review',
    iconSpec: 'fa fa-globe',
    hint: 'review page',
    isAvailable: () => uiReaders.isDeveloperMode,
  },
  {
    pagePath: '/projectResource',
    pageName: texts.sideMenuApps.projectResourceEdit,
    iconSpec: 'fa fa-globe',
    hint: texts.sideMenuAppsHint.projectResourceEdit,
    isAvailable: () => uiReaders.isLocalProjectSelectedForEdit,
  },
  {
    pagePath: '/projectSelection',
    pageName: texts.sideMenuApps.projectSelection,
    iconSpec: 'fa fa-globe',
    hint: texts.sideMenuAppsHint.projectSelection,
  },
  {
    pagePath: '/firmwareUpdate',
    pageName: texts.sideMenuApps.firmwareUpdate,
    iconSpec: 'fa fa-microchip',
    hint: texts.sideMenuAppsHint.firmwareUpdate,
  },
  {
    pagePath: '/firmwareFlash',
    pageName: 'flash',
    iconSpec: 'fa fa-microchip',
    hint: texts.sideMenuAppsHint.firmwareUpdate,
    isAvailable: () => false,
  },
  {
    pagePath: '/settings',
    pageName: texts.sideMenuApps.settings,
    iconSpec: 'fa fa-cog',
    hint: texts.sideMenuAppsHint.settings,
  },
  {
    pagePath: '/home',
    pageName: texts.sideMenuApps.entrance,
    iconSpec: 'fa fa-door-open',
    hint: texts.sideMenuAppsHint.entrance,
  },
];

export function useNavigationButtonsAreaModel(): NavigationBarModel {
  const currentPagePath = uiReaders.pagePath;
  return {
    navigationItems: itemsSource
      .filter((it) => (it.isAvailable ? it.isAvailable() : true))
      .map((it) => ({
        pagePath: it.pagePath,
        pageName: it.pageName,
        iconSpec: it.iconSpec,
        hint: it.hint,
        isCurrent: it.pagePath === currentPagePath,
        onClick: () => uiActions.navigateTo(it.pagePath),
      })),
  };
}
