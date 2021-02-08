import { router } from '~/ui-common';
import { PagePaths } from '~/ui-common/sharedModels/UiStatusModel';

export interface NavigationEntryViewModel {
  pagePath: PagePaths;
  faIconName: string;
  isCurrent: boolean;
  onClick: () => void;
}

interface NavigationEntrySource {
  pagePath: PagePaths;
  faIconName: string;
}

const entrySources: NavigationEntrySource[] = [
  { pagePath: '/editor', faIconName: 'fa-keyboard' },
  { pagePath: '/layouter', faIconName: 'fa-drafting-compass' },
  { pagePath: '/presetBrowser', faIconName: 'fa-book' },
  { pagePath: '/shapePreview', faIconName: 'fa-file-code' },
  { pagePath: '/heatmap', faIconName: 'fa-chart-bar' },
  { pagePath: '/firmwareUpdation', faIconName: 'fa-microchip' },
  { pagePath: '/settings', faIconName: 'fa-cog' },
];

export interface INavigationViewModel {
  entries: NavigationEntryViewModel[];
}

export function makeNavigationViewModel(): INavigationViewModel {
  const currentPagePath = router.getPagePath();
  return {
    entries: entrySources.map((it) => ({
      pagePath: it.pagePath,
      faIconName: it.faIconName,
      isCurrent: it.pagePath === currentPagePath,
      onClick: () => router.navigateTo(it.pagePath),
    })),
  };
}
