import { EditorModel } from './EditorModel';
import { PlayerModel } from './PlayerModel';
import { ProfilesModel } from './ProfilesModel';
import { SiteModel } from './SiteModel';
import { KeyboardConfigModel } from './KeyboardConfigModel';
import { DeviceStatusModel } from './DeviceStatusModel';
import { UiStatusModel } from './UiStatusModel';
import { ThemeSelectionModel } from './ThemeSelectionModel';

export const appDomain = new (class {
  readonly editorModel = new EditorModel();
  readonly playerModel = new PlayerModel(this.editorModel);
  readonly profilesModel = new ProfilesModel(this.editorModel);
  readonly siteModel = new SiteModel();
  readonly keyboardConfigModel = new KeyboardConfigModel();
  readonly deviceStatusModel = new DeviceStatusModel();
  readonly uiStatusModel = new UiStatusModel();
  readonly themeSelectionModel = new ThemeSelectionModel();

  initialize() {
    // this.siteModel.isWidgetMode = true;

    // debugTrace('start appDomain initialize');
    this.playerModel.initialize();
    this.profilesModel.initialize();
    this.siteModel.initialize();
    this.keyboardConfigModel.intialize();
    this.deviceStatusModel.initialize();
    this.uiStatusModel.initialize();
    this.themeSelectionModel.initialize();
  }

  terminate() {
    this.themeSelectionModel.finalize();
    this.uiStatusModel.finalize();
    this.deviceStatusModel.finalinze();
    this.keyboardConfigModel.finalize();
    this.playerModel.finalize();
    this.profilesModel.finalize();
    // debugTrace('end appDomain terminate');
    this.siteModel.finalize();
  }
})();

export const { editorModel, playerModel, profilesModel, siteModel } = appDomain;
