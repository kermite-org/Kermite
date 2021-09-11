import produce from 'immer';
import { fallbackStandardKeyboardSpec } from '~/shared';
import { standardFirmwareEditModelHelpers } from '~/ui/features/StandardFirmwareEditor/helpers';
import { IStandardFirmwareEditValues } from '~/ui/features/StandardFirmwareEditor/types';

export const standardFirmwareEditStore = new (class {
  originalValues: IStandardFirmwareEditValues = fallbackStandardKeyboardSpec;
  editValues: IStandardFirmwareEditValues = fallbackStandardKeyboardSpec;
})();

const store = standardFirmwareEditStore;

export const standardFirmwareEditActions = {
  loadFirmwareConfig(firmwareConfig: IStandardFirmwareEditValues) {
    store.originalValues = firmwareConfig;
    store.editValues = firmwareConfig;
  },
  commitValue<K extends keyof IStandardFirmwareEditValues>(
    key: K,
    value: IStandardFirmwareEditValues[K],
  ) {
    store.editValues = produce(store.editValues, (draft) => {
      draft[key] = value;
      standardFirmwareEditModelHelpers.fixEditValuesOnModify(draft, {
        [key]: value,
      });
    });
  },
};
