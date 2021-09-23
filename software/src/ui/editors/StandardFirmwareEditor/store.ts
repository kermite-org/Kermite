import produce from 'immer';
import { fallbackStandardKeyboardSpec } from '~/shared';
import { standardFirmwareEditModelHelpers } from '~/ui/editors/StandardFirmwareEditor/helpers';
import {
  IStandardFirmwareEditErrors,
  IStandardFirmwareEditValues,
  IStandardFirmwareMcuType,
} from '~/ui/editors/StandardFirmwareEditor/types';
import { createSimpleSelector } from '~/ui/utils';

type IStandardFirmwareEditState = {
  originalValues: IStandardFirmwareEditValues;
  editValues: IStandardFirmwareEditValues;
};

const state: IStandardFirmwareEditState = {
  originalValues: fallbackStandardKeyboardSpec,
  editValues: fallbackStandardKeyboardSpec,
};

const selectors = {
  fieldErrors: createSimpleSelector(
    () => state.editValues,
    standardFirmwareEditModelHelpers.validateEditValues,
  ),
  totalError: createSimpleSelector(
    () => state.editValues,
    standardFirmwareEditModelHelpers.getTotalValidationError,
  ),
};

const readers = {
  get mcuType(): IStandardFirmwareMcuType {
    return standardFirmwareEditModelHelpers.getMcuType(
      state.editValues.baseFirmwareType,
    );
  },
  get isSplit(): boolean {
    return standardFirmwareEditModelHelpers.getIsSplit(
      state.editValues.baseFirmwareType,
    );
  },
  get fieldErrors(): IStandardFirmwareEditErrors {
    return selectors.fieldErrors();
  },
  get totalError(): string {
    return selectors.totalError();
  },
  get canSave(): boolean {
    const {
      state: { originalValues, editValues },
      readers: { fieldErrors, totalError },
    } = standardFirmwareEditStore;
    const isModified = editValues !== originalValues;
    const hasError = Object.values(fieldErrors).some((a) => !!a);
    return isModified && !hasError && !totalError;
  },
};

const actions = {
  loadFirmwareConfig(firmwareConfig: IStandardFirmwareEditValues) {
    state.originalValues = firmwareConfig;
    state.editValues = firmwareConfig;
  },
  commitValue<K extends keyof IStandardFirmwareEditValues>(
    key: K,
    value: IStandardFirmwareEditValues[K],
  ) {
    state.editValues = produce(state.editValues, (draft) => {
      draft[key] = value;
      standardFirmwareEditModelHelpers.fixEditValuesOnModify(draft, {
        [key]: value,
      });
    });
  },
};

export const standardFirmwareEditStore = {
  state,
  readers,
  actions,
};
