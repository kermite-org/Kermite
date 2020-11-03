import { Models } from '~ui/models';
import { IUiSettings, PageSignature } from '~ui/models/UiStatusModel';

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
  { pageSig: 'presetBrowser', faIconName: 'fa-book' }
];

export class NavigationViewModel {
  constructor(private models: Models) {}

  private get settings(): IUiSettings {
    return this.models.uiStatusModel.settings;
  }

  get entries(): NavigationEntryViewModel[] {
    return entrySources.map((it) => ({
      pageSig: it.pageSig,
      faIconName: it.faIconName,
      isCurrent: this.settings.page === it.pageSig,
      onClick: () => (this.settings.page = it.pageSig)
    }));
  }
}
