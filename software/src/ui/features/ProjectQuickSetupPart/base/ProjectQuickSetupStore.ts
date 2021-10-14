import produce from 'immer';
import {
  fallbackStandardFirmwareEntry,
  IKermiteStandardKeyboardSpec,
  IStandardFirmwareEntry,
} from '~/shared';
import { projectQuickSetupStoreHelpers } from '~/ui/features/ProjectQuickSetupPart/base/ProjectQuickSetupStoreHelpers';

const state = new (class {
  keyboardName: string = '';
  firmwareEntry: IStandardFirmwareEntry = fallbackStandardFirmwareEntry;
  isConfigValid: boolean = false;
})();

const actions = {
  writeFirmwareConfig(data: IKermiteStandardKeyboardSpec | undefined) {
    if (data) {
      state.firmwareEntry = produce(state.firmwareEntry, (draft) => {
        draft.standardFirmwareConfig = data;
        draft.variationId = projectQuickSetupStoreHelpers.getNextVariationId(
          draft.variationId,
        );
      });
      state.isConfigValid = true;
    } else {
      state.isConfigValid = false;
    }
  },
};

export const projectQuickSetupStore = {
  state,
  actions,
};
