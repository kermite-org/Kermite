import { projectResourceModel } from '~/ui-common/sharedModels/ProjectResourceModel';
import { uiStatusModel } from '~/ui-common/sharedModels/UiStatusModel';

export class Models {
  async initialize() {
    await projectResourceModel.initializeAsync();
    uiStatusModel.initialize();
  }

  finalize() {
    uiStatusModel.finalize();
  }
}

export const models = new Models();
