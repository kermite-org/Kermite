import { EditorModel } from './EditorModel';
import { PlayerModel } from './PlayerModel';
import { ProfilesModel } from './ProfilesModel';
import { SiteModel } from './SiteModel';
import { KeyboardConfigModel } from './KeyboardConfigModel';
import { DeviceStatusModel } from './DeviceStatusModel';
import { UiStatusModel } from './UiStatusModel';
import { ThemeSelectionModel } from './ThemeSelectionModel';
import { KeyboardShapesModel } from './KeyboardShapesModel';
import { FirmwareUpdationModel } from './FirmwareUpdationModel';

export const models = new (class {
  readonly editorModel = new EditorModel();
  readonly playerModel = new PlayerModel(this.editorModel);
  readonly profilesModel = new ProfilesModel(this.editorModel);
  readonly siteModel = new SiteModel();
  readonly keyboardConfigModel = new KeyboardConfigModel();
  readonly deviceStatusModel = new DeviceStatusModel();
  readonly uiStatusModel = new UiStatusModel();
  readonly themeSelectionModel = new ThemeSelectionModel();
  readonly keyboardShapesModel = new KeyboardShapesModel();
  readonly firmwareUpdationModel = new FirmwareUpdationModel();

  initialize() {
    // this.siteModel.isWidgetMode = true;
    // debugTrace('start appDomain initialize');
    this.playerModel.initialize();
    this.profilesModel.initialize();
    this.siteModel.initialize();
    this.keyboardConfigModel.initialize();
    this.deviceStatusModel.initialize();
    this.uiStatusModel.initialize();
    this.themeSelectionModel.initialize();
    this.keyboardShapesModel.initialize();
    this.firmwareUpdationModel.initialize();
  }

  finalize() {
    this.firmwareUpdationModel.finalize();
    this.keyboardShapesModel.finalize();
    this.themeSelectionModel.finalize();
    this.uiStatusModel.finalize();
    this.deviceStatusModel.finalize();
    this.keyboardConfigModel.finalize();
    this.playerModel.finalize();
    this.profilesModel.finalize();
    this.siteModel.finalize();
    // debugTrace('end appDomain terminate');
  }
})();

export const {
  editorModel,
  playerModel,
  profilesModel,
  siteModel,
  uiStatusModel
} = models;
