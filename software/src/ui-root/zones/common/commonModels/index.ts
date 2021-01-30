import { projectResourceModel } from '~/ui-common/sharedModels/ProjectResourceModel';
import { uiStatusModel } from '~/ui-common/sharedModels/UiStatusModel';
import { siteModel } from '~/ui-root/zones/common/commonModels/SiteModel';
import { profilesModel } from '~/ui-root/zones/editor/ProfileManagement/models/ProfilesModel';

export class Models {
  async initialize() {
    await projectResourceModel.initializeAsync();
    siteModel.initialize();
    profilesModel.initialize();
    uiStatusModel.initialize();
  }

  finalize() {
    uiStatusModel.finalize();
    profilesModel.finalize();
    siteModel.finalize();
  }
}

export const models = new Models();
