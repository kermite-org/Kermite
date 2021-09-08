import produce from 'immer';
import {
  fallbackStandardKeyboardSpec,
  IKermiteStandardKeyboardSpec,
} from '~/shared';
import { ISelectorOption, makePlainSelectorOption } from '~/ui/base';
import { standardFirmwareEditModelHelpers } from '~/ui/features/StandardFirmwareEditor/StandardFirmwareEditModel.helpers';

export type IStandardFirmwareEditValues = IKermiteStandardKeyboardSpec;

const baseFirmwareTypeOptions: ISelectorOption[] = [
  'AvrUnified',
  'RpUnified',
].map(makePlainSelectorOption);

const availablePinsTextAvr = 'PB0~PB7, PC0~PC7, PD0~PD7, PE0~PE7, PF0~PF7';
const availablePinsTextRp = 'GP0~GP29';

const constants = {
  baseFirmwareTypeOptions,
};

const store = new (class {
  originalValues: IStandardFirmwareEditValues = fallbackStandardKeyboardSpec;
  editValues: IStandardFirmwareEditValues = fallbackStandardKeyboardSpec;
})();

const readers = {
  get originalValues(): IStandardFirmwareEditValues {
    return store.originalValues;
  },
  get editValues(): IStandardFirmwareEditValues {
    return store.editValues;
  },
  get isAvr(): boolean {
    const { baseFirmwareType } = store.editValues;
    return baseFirmwareType === 'AvrUnified' || baseFirmwareType === 'AvrSplit';
  },
  get isRp(): boolean {
    const { baseFirmwareType } = store.editValues;
    return baseFirmwareType === 'RpUnified' || baseFirmwareType === 'RpSplit';
  },
  get availablePinsText(): string {
    return readers.isAvr ? availablePinsTextAvr : availablePinsTextRp;
  },
  get mcuType() {
    return readers.isAvr ? 'avr' : 'rp';
  },
  get rowPinsValid(): boolean {
    const { editValues, mcuType } = readers;
    return standardFirmwareEditModelHelpers.validatePins(
      editValues.matrixRowPins,
      mcuType,
    );
  },
  get columnPinsValid(): boolean {
    const { editValues, mcuType } = readers;
    return standardFirmwareEditModelHelpers.validatePins(
      editValues.matrixColumnPins,
      mcuType,
    );
  },
  get isModified(): boolean {
    const { originalValues, editValues } = readers;
    return editValues !== originalValues;
  },
  get canSave(): boolean {
    const { isModified, rowPinsValid, columnPinsValid } = readers;
    return isModified && rowPinsValid && columnPinsValid;
  },
};

const actions = {
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

export const standardFirmwareEditModel = {
  constants,
  readers,
  actions,
};
