import { projectResourceModel } from '~/ui-common/sharedModels/ProjectResourceModel';
import { uiStatusModel } from '~/ui-common/sharedModels/UiStatusModel';
import { playerModel } from '~/ui-root/zones/common/commonModels/PlayerModel';
import { siteModel } from '~/ui-root/zones/common/commonModels/SiteModel';
import { profilesModel } from '~/ui-root/zones/editorProfilesSection/models/ProfilesModel';

export class Models {
  async initialize() {
    await projectResourceModel.initializeAsync();
    siteModel.initialize();
    profilesModel.initialize();
    playerModel.initialize();
    uiStatusModel.initialize();
  }

  finalize() {
    uiStatusModel.finalize();
    playerModel.finalize();
    profilesModel.finalize();
    siteModel.finalize();
  }
}

export const models = new Models();
