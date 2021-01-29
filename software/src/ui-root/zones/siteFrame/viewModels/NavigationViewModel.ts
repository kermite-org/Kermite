import { models } from '~/ui-root/zones/common/commonModels';
import { PageSignature } from '~/ui-root/zones/common/commonModels/UiStatusModel';

export interface NavigationEntryViewModel {
  pageSig: PageSignature;
  faIconName: string;
  isCurrent: boolean;
  onClick: () => void;
}

interface NavigationEntrySource {
  pageSig: PageSignature;
  faIconName: string;
}

const entrySources: NavigationEntrySource[] = [
  { pageSig: 'editor', faIconName: 'fa-keyboard' },
  { pageSig: 'layouter', faIconName: 'fa-drafting-compass' },
  { pageSig: 'presetBrowser', faIconName: 'fa-book' },
  { pageSig: 'shapePreview', faIconName: 'fa-file-code' },
  { pageSig: 'heatmap', faIconName: 'fa-chart-bar' },
  { pageSig: 'firmwareUpdation', faIconName: 'fa-microchip' },
];

export interface INavigationViewModel {
  entries: NavigationEntryViewModel[];
}

export function makeNavigationViewModel(): INavigationViewModel {
  const { settings } = models.uiStatusModel;
  return {
    entries: entrySources.map((it) => ({
      pageSig: it.pageSig,
      faIconName: it.faIconName,
      isCurrent: settings.page === it.pageSig,
      onClick: () => (settings.page = it.pageSig),
    })),
  };
}
