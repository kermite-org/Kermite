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
  firmwareConfig: IKermiteStandardKeyboardSpec = fallbackStandardKeyboardSpec;
  firmwareName: string = 'default';
  isConfigValid: boolean = false;
})();

const readers = {
  emitDraftProjectInfo(): IProjectPackageInfo {
    const { projectId, keyboardName, firmwareConfig, firmwareName } = state;
    return projectQuickSetupStoreHelpers.createDraftPackageInfo(
      projectId,
      keyboardName,
      firmwareConfig,
      firmwareName,
    );
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
