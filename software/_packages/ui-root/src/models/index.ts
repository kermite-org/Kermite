import { SiteModel } from './SiteModel';
import { ThemeSelectionModel } from './ThemeSelectionModel';
import { UiStatusModel } from './UiStatusModel';

export class Models {
  uiStatusModel = new UiStatusModel();
  siteModel = new SiteModel();
  themeSelectionModel = new ThemeSelectionModel();

  async initialize() {
    this.siteModel.initialize();
    this.uiStatusModel.initialize();
    this.themeSelectionModel.initialize();
  }

  finalize() {
    this.uiStatusModel.finalize();
    this.siteModel.finalize();
  }
}

export const models = new Models();
