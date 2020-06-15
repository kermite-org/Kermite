import { overwriteObjectProps } from '~funcs/Utils';
import { siteModel } from './zAppDomain';

interface IUiSettings {
  showTestInputArea: boolean;
  page: 'editor' | 'shapePreview';
  shapeViewBreedName: string;
}

const defaultUiSettins: IUiSettings = {
  showTestInputArea: false,
  page: 'editor',
  shapeViewBreedName: ''
};

export class UiStatusModel {
  readonly settings: IUiSettings = defaultUiSettins;

  initialize() {
    const settingsText = localStorage.getItem('uiSettings');
    if (settingsText) {
      const settings = JSON.parse(settingsText);
      overwriteObjectProps(this.settings, settings);
    }
    if (!siteModel.isDevelopment || !this.settings.page) {
      this.settings.page = 'editor';
    }
  }

  save() {
    const settingsText = JSON.stringify(this.settings);
    localStorage.setItem('uiSettings', settingsText);
  }

  finalize() {
    this.save();
  }
}
