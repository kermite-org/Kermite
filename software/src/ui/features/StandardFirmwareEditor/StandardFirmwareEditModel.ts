import produce from 'immer';
import { fallbackStandardKeyboardSpec } from '~/shared';
import { ISelectorOption, makePlainSelectorOption } from '~/ui/base';
import { standardFirmwareEditModelHelpers } from '~/ui/features/StandardFirmwareEditor/StandardFirmwareEditModel.helpers';
import {
  IStandardFirmwareEditValues,
  IStandardFirmwareMcuType,
} from '~/ui/features/StandardFirmwareEditor/types';

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
  get mcuType(): IStandardFirmwareMcuType {
    return standardFirmwareEditModelHelpers.getMcuType(
      readers.editValues.baseFirmwareType,
    );
  },
  get availablePinsText(): string {
    return readers.mcuType === 'avr'
      ? availablePinsTextAvr
      : availablePinsTextRp;
  },
  get isAvr(): boolean {
    return readers.mcuType === 'avr';
  },
  get isRp(): boolean {
    return readers.mcuType === 'rp';
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
  get directWiredPinsValid(): boolean {
    const { editValues, mcuType } = readers;
    return standardFirmwareEditModelHelpers.validatePins(
      editValues.directWiredPins,
      mcuType,
    );
  },
  get encoderPinsValid(): boolean {
    const { editValues, mcuType } = readers;
    return (
      standardFirmwareEditModelHelpers.validatePins(
        editValues.encoderPins,
        mcuType,
      ) && editValues.encoderPins?.length === 2
    );
  },
  get lightingPinValid(): boolean {
    const { editValues, mcuType } = readers;
    return standardFirmwareEditModelHelpers.validatePins(
      [editValues.lightingPin || ''],
      mcuType,
    );
  },
  get lightingNumLedsValid(): boolean {
    const {
      editValues: { lightingNumLeds },
    } = readers;
    return lightingNumLeds
      ? 0 <= lightingNumLeds && lightingNumLeds < 256
      : false;
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
