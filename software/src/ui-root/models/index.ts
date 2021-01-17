import { PresetBrowserModel } from '@ui-root/models/PresetBrowserModel';
import { RealtimeHeatmapModel } from '@ui-root/models/RealtimeHeatmapModel';
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

export class Models {
  deviceStatusModel = new DeviceStatusModel();
  editorModel = new EditorModel();
  playerModel = new PlayerModel(this.editorModel);
  profilesModel = new ProfilesModel(this.editorModel);
  keyboardConfigModel = new KeyboardConfigModel();

  projectResourceModel = new ProjectResourceModel();
  firmwareUpdationModel = new FirmwareUpdationModel(this.projectResourceModel);
  uiStatusModel = new UiStatusModel();

  keyboardShapesModel = new KeyboardShapesModel(
    this.projectResourceModel,
    this.uiStatusModel,
  );

  siteModel = new SiteModel();
  themeSelectionModel = new ThemeSelectionModel();

  presetBrowserModel = new PresetBrowserModel(
    this.projectResourceModel,
    this.profilesModel,
    this.uiStatusModel,
  );

  realtimeHeatmapModel = new RealtimeHeatmapModel(this.editorModel);

  async initialize() {
    await this.projectResourceModel.initializeAsync();
    this.siteModel.initialize();
    this.profilesModel.initialize();
    this.playerModel.initialize();
    this.keyboardConfigModel.initialize();
    this.deviceStatusModel.initialize();
    this.uiStatusModel.initialize();
    this.themeSelectionModel.initialize();
    this.keyboardShapesModel.initialize();
    this.firmwareUpdationModel.initialize();
    this.presetBrowserModel.initialize();
    this.realtimeHeatmapModel.initialize();
  }

  finalize() {
    this.realtimeHeatmapModel.finalize();
    this.firmwareUpdationModel.finalize();
    this.keyboardShapesModel.finalize();
    this.uiStatusModel.finalize();
    this.deviceStatusModel.finalize();
    this.playerModel.finalize();
    this.profilesModel.finalize();
    this.siteModel.finalize();
  }
}

export const models = new Models();
