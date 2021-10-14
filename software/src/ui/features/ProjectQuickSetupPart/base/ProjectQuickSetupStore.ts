import {
  fallbackStandardKeyboardSpec,
  IKermiteStandardKeyboardSpec,
} from '~/shared';
import { appUi } from '~/ui/base';
import { projectQuickSetupStoreHelpers } from '~/ui/features/ProjectQuickSetupPart/base/ProjectQuickSetupStoreHelpers';

const state = new (class {
  projectId: string = '';
  keyboardName: string = '';
  firmwareConfig: IKermiteStandardKeyboardSpec = fallbackStandardKeyboardSpec;
  isConfigValid: boolean = false;
})();

const actions = {
  writeFirmwareConfig(data: IKermiteStandardKeyboardSpec | undefined) {
    if (data) {
      state.firmwareConfig = data;
      state.projectId = projectQuickSetupStoreHelpers.generateUniqueProjectId();
      state.isConfigValid = true;
      appUi.setDebugValue({ projectId: state.projectId });
    } else {
      state.isConfigValid = false;
    }
  },
};

export const projectQuickSetupStore = {
  state,
  actions,
};
