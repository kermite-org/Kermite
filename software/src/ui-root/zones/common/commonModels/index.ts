import { deviceStatusModel } from '~/ui-root/zones/common/commonModels/DeviceStatusModel';
import { playerModel } from '~/ui-root/zones/common/commonModels/PlayerModel';
import { projectResourceModel } from '~/ui-root/zones/common/commonModels/ProjectResourceModel';
import { siteModel } from '~/ui-root/zones/common/commonModels/SiteModel';
import { uiStatusModel } from '~/ui-root/zones/common/commonModels/UiStatusModel';
import { profilesModel } from '~/ui-root/zones/editorProfilesSection/models/ProfilesModel';
import { firmwareUpdationModel } from '~/ui-root/zones/firmup/FirmwareUpdationModel';
import { realtimeHeatmapModel } from '~/ui-root/zones/heatmap/RealtimeHeatmapModel';
import { presetBrowserModel } from '~/ui-root/zones/presetBrowser/models/PresetBrowserModel';

export class Models {
  async initialize() {
    await projectResourceModel.initializeAsync();
    siteModel.initialize();
    profilesModel.initialize();
    playerModel.initialize();

    deviceStatusModel.initialize();
    uiStatusModel.initialize();
    // this.keyboardShapesModel.initialize();
    firmwareUpdationModel.initialize();
    presetBrowserModel.initialize();
    realtimeHeatmapModel.initialize();
  }

  finalize() {
    realtimeHeatmapModel.finalize();
    firmwareUpdationModel.finalize();
    // this.keyboardShapesModel.finalize();
    uiStatusModel.finalize();
    deviceStatusModel.finalize();
    playerModel.finalize();
    profilesModel.finalize();
    siteModel.finalize();
  }
}

export const models = new Models();
