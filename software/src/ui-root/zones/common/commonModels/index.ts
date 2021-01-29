import { RealtimeHeatmapModel } from '~/ui-root/zones/heatmap/RealtimeHeatmapModel';
import { PresetBrowserModel } from '~/ui-root/zones/presetBrowser/models/PresetBrowserModel';
import { EditorModel } from '../../editor/models/EditorModel';
import { KeyboardConfigModel } from '../../editorProfilesSection/KeyboardConfigModel';
import { ProfilesModel } from '../../editorProfilesSection/models/ProfilesModel';
import { FirmwareUpdationModel } from '../../firmup/FirmwareUpdationModel';
import { KeyboardShapesModel } from '../../shapePreview/KeyboardShapesModel';
import { DeviceStatusModel } from './DeviceStatusModel';
import { PlayerModel } from './PlayerModel';
import { ProjectResourceModel } from './ProjectResourceModel';
import { SiteModel } from './SiteModel';
import { UiStatusModel } from './UiStatusModel';

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
    // this.keyboardShapesModel.initialize();
    this.firmwareUpdationModel.initialize();
    this.presetBrowserModel.initialize();
    this.realtimeHeatmapModel.initialize();
  }

  finalize() {
    this.realtimeHeatmapModel.finalize();
    this.firmwareUpdationModel.finalize();
    // this.keyboardShapesModel.finalize();
    this.uiStatusModel.finalize();
    this.deviceStatusModel.finalize();
    this.playerModel.finalize();
    this.profilesModel.finalize();
    this.siteModel.finalize();
  }
}

export const models = new Models();
