import { deviceStatusModel } from './DeviceStatusModel';
import { firmwareUpdationModel } from './FirmwareUpdationModel';
import { keyboardConfigModel } from './KeyboardConfigModel';
import { keyboardShapesModel } from './KeyboardShapesModel';
import { projectResourceModel } from './ProjectResourceModel';
import { siteModel } from './SiteModel';
import { themeSelectionModel } from './ThemeSelectionModel';
import { uiStatusModel } from './UiStatusModel';
import { editorModel } from './editor/EditorModel';
import { playerModel } from './player/PlayerModel';
import { profilesModel } from './profile/ProfilesModel';

export const models = new (class {
  initialize() {
    // siteModel.isWidgetMode = true;
    // debugTrace('start appDomain initialize');
    projectResourceModel.initialize();
    siteModel.initialize();
    profilesModel.initialize();
    playerModel.initialize();
    keyboardConfigModel.initialize();
    deviceStatusModel.initialize();
    uiStatusModel.initialize();
    themeSelectionModel.initialize();
    keyboardShapesModel.initialize();
    firmwareUpdationModel.initialize();
  }

  finalize() {
    themeSelectionModel.finalize();
    uiStatusModel.finalize();
    deviceStatusModel.finalize();
    playerModel.finalize();
    profilesModel.finalize();
    siteModel.finalize();
    // debugTrace('end appDomain terminate');
  }
})();

export {
  editorModel,
  playerModel,
  profilesModel,
  siteModel,
  keyboardConfigModel,
  deviceStatusModel,
  uiStatusModel,
  themeSelectionModel,
  keyboardShapesModel,
  firmwareUpdationModel
};
