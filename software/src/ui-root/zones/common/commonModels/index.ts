import { projectResourceModel } from '~/ui-common/sharedModels/ProjectResourceModel';
import { uiStatusModel } from '~/ui-common/sharedModels/UiStatusModel';
import { profilesModel } from '~/ui-root/zones/editor/ProfileManagement/models/ProfilesModel';

export class Models {
  async initialize() {
    await projectResourceModel.initializeAsync();
    profilesModel.initialize();
    uiStatusModel.initialize();
  }

  finalize() {
    uiStatusModel.finalize();
    profilesModel.finalize();
  }
}

export const models = new Models();
