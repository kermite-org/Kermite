import {
  duplicateObjectByJsonStringifyParse,
  fallbackStandardKeyboardSpec,
  IKermiteStandardKeyboardSpec,
} from '~/shared';
import { ISelectorOption, makePlainSelectorOption } from '~/ui/base';
import { firmwareEditModelHelpers } from '~/ui/features/StandardFirmwareEditor/FirmwareEditModel.helpers';

export type IFirmwareEditValues = IKermiteStandardKeyboardSpec;

const baseFirmwareTypeOptions: ISelectorOption[] = [
  'AvrUnified',
  'RpUnified',
].map(makePlainSelectorOption);

const availablePinsTextAvr = 'PB0~PB7, PC0~PC7, PD0~PD7, PE0~PE7, PF0~PF7';
const availablePinsTextRp = 'GP0~GP29';

const constants = {
  baseFirmwareTypeOptions,
};

const store = {
  editValues: fallbackStandardKeyboardSpec,
};

const readers = {
  get editValues(): IFirmwareEditValues {
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
    return firmwareEditModelHelpers.validatePins(
      editValues.matrixRowPins,
      mcuType,
    );
  },
  get columnPinsValid(): boolean {
    const { editValues, mcuType } = readers;
    return firmwareEditModelHelpers.validatePins(
      editValues.matrixColumnPins,
      mcuType,
    );
  },
  get canSave() {
    const { rowPinsValid, columnPinsValid } = readers;
    return rowPinsValid && columnPinsValid;
  },
};

function fixEditValues(diff: Partial<IFirmwareEditValues>) {
  const { editValues } = store;
  if (readers.isAvr) {
    editValues.useBoardLedsProMicroRp = false;
    editValues.useBoardLedsRpiPico = false;
  }
  if (readers.isRp) {
    editValues.useBoardLedsProMicroAvr = false;
  }
  if (diff.baseFirmwareType) {
    editValues.matrixRowPins = undefined;
    editValues.matrixColumnPins = undefined;
  }
  if (diff.useBoardLedsProMicroRp) {
    editValues.useBoardLedsRpiPico = false;
  }
  if (diff.useBoardLedsRpiPico) {
    editValues.useBoardLedsProMicroRp = false;
  }
}

const actions = {
  loadFirmwareConfig(firmwareConfig: IFirmwareEditValues) {
    store.editValues = duplicateObjectByJsonStringifyParse(firmwareConfig);
  },
  commitValue<K extends keyof IFirmwareEditValues>(
    key: K,
    value: IFirmwareEditValues[K],
  ) {
    store.editValues[key] = value;
    fixEditValues({ [key]: value });
  },
};

export const firmwareEditModel = {
  constants,
  readers,
  actions,
};
