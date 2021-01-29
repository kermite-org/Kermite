import { projectResourceModel } from '~/ui-common/sharedModels/ProjectResourceModel';
import { uiStatusModel } from '~/ui-common/sharedModels/UiStatusModel';
import { playerModel } from '~/ui-root/zones/common/commonModels/PlayerModel';
import { siteModel } from '~/ui-root/zones/common/commonModels/SiteModel';
import { profilesModel } from '~/ui-root/zones/editorProfilesSection/models/ProfilesModel';
import { realtimeHeatmapModel } from '~/ui-root/zones/heatmap/RealtimeHeatmapModel';

export class Models {
  async initialize() {
    await projectResourceModel.initializeAsync();
    siteModel.initialize();
    profilesModel.initialize();
    playerModel.initialize();
    uiStatusModel.initialize();
    realtimeHeatmapModel.initialize();
  }

  finalize() {
    realtimeHeatmapModel.finalize();
    uiStatusModel.finalize();
    playerModel.finalize();
    profilesModel.finalize();
    siteModel.finalize();
  }
}

export const models = new Models();
