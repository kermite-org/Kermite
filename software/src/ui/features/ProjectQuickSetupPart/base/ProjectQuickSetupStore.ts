import {
  fallbackStandardKeyboardSpec,
  IKermiteStandardKeyboardSpec,
  IProjectPackageInfo,
} from '~/shared';
import { appUi } from '~/ui/base';
import { projectQuickSetupStoreHelpers } from '~/ui/features/ProjectQuickSetupPart/base/ProjectQuickSetupStoreHelpers';

const state = new (class {
  projectId: string = '';
  keyboardName: string = '';
  firmwareVariationId: string = '01';
  firmwareName: string = 'default';
  firmwareConfig: IKermiteStandardKeyboardSpec = fallbackStandardKeyboardSpec;
  isConfigValid: boolean = false;
  isConnectionValid: boolean = false;
})();

const readers = {
  emitDraftProjectInfo(): IProjectPackageInfo {
    const {
      projectId,
      keyboardName,
      firmwareVariationId,
      firmwareName,
      firmwareConfig,
    } = state;
    return projectQuickSetupStoreHelpers.createDraftPackageInfo({
      projectId,
      keyboardName,
      firmwareVariationId,
      firmwareName,
      firmwareConfig,
    });
  },
};

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
  readers,
  actions,
};
