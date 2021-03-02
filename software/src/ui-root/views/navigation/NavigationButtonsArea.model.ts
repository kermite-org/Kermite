import { router } from '~/ui-common';
import { PagePaths } from '~/ui-common/sharedModels/UiStatusModel';

export interface NavigationEntryViewModel {
  pagePath: PagePaths;
  pageName: string;
  iconSpec: string;
  isCurrent: boolean;
  onClick: () => void;
}

interface NavigationEntrySource {
  pagePath: PagePaths;
  pageName: string;
  iconSpec: string;
}

const entrySources: NavigationEntrySource[] = [
  { pagePath: '/editor', pageName: 'Assigner', iconSpec: 'fa fa-keyboard' },
  {
    pagePath: '/layouter',
    pageName: 'Drafter',
    iconSpec: 'fa fa-drafting-compass',
  },
  { pagePath: '/presetBrowser', pageName: 'Presets', iconSpec: 'fa fa-book' },
  {
    pagePath: '/shapePreview',
    pageName: 'Preview',
    iconSpec: 'fa fa-file-code',
  },
  { pagePath: '/heatmap', pageName: 'Heatmap', iconSpec: 'fa fa-chart-bar' },
  {
    pagePath: '/firmwareUpdation',
    pageName: 'Device',
    iconSpec: 'fa fa-microchip',
  },
  { pagePath: '/settings', pageName: 'Settings', iconSpec: 'fa fa-cog' },
];

// const entrySources: NavigationEntrySource[] = [
//   { pagePath: '/editor', pageName: 'Assigner', iconSpec: 'keyboard' },
//   {
//     pagePath: '/layouter',
//     pageName: 'Drafter',
//     iconSpec: 'architecture',
//   },
//   { pagePath: '/presetBrowser', pageName: 'Presets', iconSpec: 'menu_book' },
//   { pagePath: '/shapePreview', pageName: 'Preview', iconSpec: 'format_shapes' },
//   { pagePath: '/heatmap', pageName: 'Heatmap', iconSpec: 'analytics' },
//   {
//     pagePath: '/firmwareUpdation',
//     pageName: 'Firmware',
//     iconSpec: 'memory',
//   },
//   { pagePath: '/settings', pageName: 'Settings', iconSpec: 'settings' },
// ];

export interface INavigationViewModel {
  entries: NavigationEntryViewModel[];
}

export function makeNavigationViewModel(): INavigationViewModel {
  const currentPagePath = router.getPagePath();
  return {
    entries: entrySources.map((it) => ({
      pagePath: it.pagePath,
      pageName: it.pageName,
      iconSpec: it.iconSpec,
      isCurrent: it.pagePath === currentPagePath,
      onClick: () => router.navigateTo(it.pagePath),
    })),
  };
}
