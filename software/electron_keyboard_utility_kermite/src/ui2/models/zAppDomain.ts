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

export const appDomain = new (class {
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

  async initialize() {
    // this.siteModel.isWidgetMode = true;
    // debugTrace('start appDomain initialize');
    await this.playerModel.initialize();
    await this.profilesModel.initialize();
    await this.siteModel.initialize();
    await this.keyboardConfigModel.intialize();
    await this.deviceStatusModel.initialize();
    await this.uiStatusModel.initialize();
    await this.themeSelectionModel.initialize();
    await this.keyboardShapesModel.initialize();
    await this.firmwareUpdationModel.initialize();
  }

  async terminate() {
    await this.firmwareUpdationModel.finalize();
    await this.keyboardShapesModel.finalize();
    await this.themeSelectionModel.finalize();
    await this.uiStatusModel.finalize();
    await this.deviceStatusModel.finalinze();
    await this.keyboardConfigModel.finalize();
    await this.playerModel.finalize();
    await this.profilesModel.finalize();
    await this.siteModel.finalize();
    // debugTrace('end appDomain terminate');
  }
})();

export const { editorModel, playerModel, profilesModel, siteModel } = appDomain;
