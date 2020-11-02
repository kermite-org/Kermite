import { DeviceStatusModel } from './DeviceStatusModel';
import { FirmwareUpdationModel } from './FirmwareUpdationModel';
import { KeyboardConfigModel } from './KeyboardConfigModel';
import { KeyboardShapesModel } from './KeyboardShapesModel';
import { ProjectResourceModel } from './ProjectResourceModel';
import { SiteModel } from './SiteModel';
import { ThemeSelectionModel } from './ThemeSelectionModel';
import { UiStatusModel } from './UiStatusModel';
import { EditorModel } from './editor/EditorModel';
import { PlayerModel } from './player/PlayerModel';
import { ProfilesModel } from './profile/ProfilesModel';

class Models {
  deviceStatusModel = new DeviceStatusModel();
  editorModel = new EditorModel();
  playerModel = new PlayerModel(this.editorModel);
  profilesModel = new ProfilesModel(this.editorModel);
  firmwareUpdationModel = new FirmwareUpdationModel();
  keyboardConfigModel = new KeyboardConfigModel();
  keyboardShapesModel = new KeyboardShapesModel();
  projectResourceModel = new ProjectResourceModel();
  siteModel = new SiteModel();
  themeSelectionModel = new ThemeSelectionModel();
  uiStatusModel = new UiStatusModel();

  initialize() {
    this.projectResourceModel.initialize();
    this.siteModel.initialize();
    this.profilesModel.initialize();
    this.playerModel.initialize();
    this.keyboardConfigModel.initialize();
    this.deviceStatusModel.initialize();
    this.uiStatusModel.initialize();
    this.themeSelectionModel.initialize();
    this.keyboardShapesModel.initialize();
    this.firmwareUpdationModel.initialize();
  }

  finalize() {
    this.themeSelectionModel.finalize();
    this.uiStatusModel.finalize();
    this.deviceStatusModel.finalize();
    this.playerModel.finalize();
    this.profilesModel.finalize();
    this.siteModel.finalize();
  }
}

export const models = new Models();

const {
  deviceStatusModel,
  editorModel,
  playerModel,
  profilesModel,
  siteModel,
  keyboardConfigModel,
  uiStatusModel,
  themeSelectionModel,
  keyboardShapesModel,
  firmwareUpdationModel
} = models;

export {
  deviceStatusModel,
  editorModel,
  playerModel,
  profilesModel,
  siteModel,
  keyboardConfigModel,
  uiStatusModel,
  themeSelectionModel,
  keyboardShapesModel,
  firmwareUpdationModel
};
