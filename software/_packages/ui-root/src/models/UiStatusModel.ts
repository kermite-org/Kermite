import { overwriteObjectProps } from '~/shared';
import { appUi } from '~/ui-common';

export type PageSignature =
  | 'editor'
  | 'shapePreview'
  | 'firmwareUpdation'
  | 'presetBrowser'
  | 'heatmap';

export interface IUiSettings {
  page: PageSignature;
}

const defaultUiSettings: IUiSettings = {
  page: 'editor',
};

export class UiStatusModel {
  readonly settings: IUiSettings = defaultUiSettings;

  initialize() {
    const settingsText = localStorage.getItem('ui-root#uiSettings');
    if (settingsText) {
      const settings = JSON.parse(settingsText);
      overwriteObjectProps(this.settings, settings);
    }
    if (!appUi.isDevelopment || !this.settings.page) {
      this.settings.page = 'editor';
    }
  }

  navigateTo(page: PageSignature) {
    this.settings.page = page;
  }

  save() {
    const settingsText = JSON.stringify(this.settings);
    localStorage.setItem('ui-root#uiSettings', settingsText);
  }

  finalize() {
    this.save();
  }
}
