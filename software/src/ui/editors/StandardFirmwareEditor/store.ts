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
  isNewConfig: boolean;
  originalValues: IStandardFirmwareEditValues;
  editValues: IStandardFirmwareEditValues;
};

const state: IStandardFirmwareEditState = {
  isNewConfig: false,
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
  get isOddSplit(): boolean {
    return standardFirmwareEditModelHelpers.getIsOddSplit(
      state.editValues.baseFirmwareType,
    );
  },
  get fieldErrors(): IStandardFirmwareEditErrors {
    return selectors.fieldErrors();
  },
  get totalError(): string {
    return selectors.totalError();
  },
  get isModified(): boolean {
    const {
      state: { originalValues, editValues },
    } = standardFirmwareEditStore;
    return editValues !== originalValues;
  },
  get isValid(): boolean {
    const {
      readers: { fieldErrors, totalError },
    } = standardFirmwareEditStore;
    const hasError = Object.values(fieldErrors).some((a) => !!a);
    return !hasError && !totalError;
  },
  get canSave(): boolean {
    const {
      state: { originalValues, editValues, isNewConfig },
    } = standardFirmwareEditStore;
    const isModified = editValues !== originalValues;
    return (isNewConfig || isModified) && readers.isValid;
  },
};

const actions = {
  loadFirmwareConfig(
    firmwareConfig: IStandardFirmwareEditValues,
    isNewConfig: boolean,
  ) {
    state.originalValues = firmwareConfig;
    state.editValues = firmwareConfig;
    state.isNewConfig = isNewConfig;
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
      standardFirmwareEditModelHelpers.cleanupFirmwareConfig(draft);
    });
  },
};

export const standardFirmwareEditStore = {
  state,
  readers,
  actions,
};
