import { models } from '~ui/models';
import { PageSignature } from '~ui/models/UiStatusModel';

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
  { pageSig: 'firmwareUpdation', faIconName: 'fa-microchip' },
  { pageSig: 'shapePreview', faIconName: 'fa-file-code' },
  { pageSig: 'presetBrowser', faIconName: 'fa-book' },
  { pageSig: 'heatmap', faIconName: 'fa-chart-bar' },
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
