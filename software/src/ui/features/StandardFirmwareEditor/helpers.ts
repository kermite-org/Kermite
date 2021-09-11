import {
  duplicateObjectByJsonStringifyParse,
  flattenArray,
  generateNumberSequence,
  getObjectKeys,
  IKermiteStandardKeyboardSpec,
  isNumberInRange,
  IStandardBaseFirmwareType,
} from '~/shared';
import {
  IStandardFirmwareEditErrors,
  IStandardFirmwareEditValues,
  IStandardFirmwareMcuType,
} from '~/ui/features/StandardFirmwareEditor/types';

const availablePinsAvr = flattenArray(
  ['B', 'C', 'D', 'E', 'F', 'PB', 'PC', 'PD', 'PE', 'PF'].map((port) =>
    [0, 1, 2, 3, 4, 5, 6, 7].map((idx) => port + idx),
  ),
);
const availablePinsRp = generateNumberSequence(29).map((i) => 'GP' + i);

const subHelpers = {
  validatePin(pin: string, mcuType: 'avr' | 'rp'): string | undefined {
    const availablePins =
      mcuType === 'avr' ? availablePinsAvr : availablePinsRp;
    const valid = availablePins.includes(pin);
    if (!valid) {
      return `invalid pin specification`;
    }
  },
  validatePins(pins: string[], mcuType: 'avr' | 'rp'): string | undefined {
    const availablePins =
      mcuType === 'avr' ? availablePinsAvr : availablePinsRp;
    const valid = pins.every((pin) => availablePins.includes(pin)) || false;
    if (!valid) {
      return `invalid pins specification`;
    }
  },
  checkPinsCount(pins: string[], expectedLength: number): string | undefined {
    if (pins.length !== expectedLength) {
      return `number of pins should be ${expectedLength}`;
    }
  },
  checkNumberInRange(
    value: number,
    min: number,
    max: number,
  ): string | undefined {
    if (!isNumberInRange(value, min, max)) {
      return `value should be in range ${min}~${max}`;
    }
  },
};

export const standardFirmwareEditModelHelpers = {
  getMcuType(
    baseFirmwareType: IStandardBaseFirmwareType,
  ): IStandardFirmwareMcuType {
    if (baseFirmwareType === 'AvrUnified' || baseFirmwareType === 'AvrSplit') {
      return 'avr';
    } else if (
      baseFirmwareType === 'RpUnified' ||
      baseFirmwareType === 'RpSplit'
    ) {
      return 'rp';
    }
    throw new Error(`invalid baseFirmwareType ${baseFirmwareType}`);
  },

  cleanupSavingFirmwareConfig(
    sourceData: IKermiteStandardKeyboardSpec,
  ): IKermiteStandardKeyboardSpec {
    const data = duplicateObjectByJsonStringifyParse(sourceData);
    getObjectKeys(data).forEach((key) => {
      const value = data[key];
      if (value === false || (Array.isArray(value) && value.length === 0)) {
        delete data[key];
      }
    });
    const {
      baseFirmwareType,
      useBoardLedsProMicroAvr,
      useBoardLedsProMicroRp,
      useBoardLedsRpiPico,
      useDebugUart,
      useMatrixKeyScanner,
      useDirectWiredKeyScanner,
      useEncoder,
      matrixColumnPins,
      matrixRowPins,
      directWiredPins,
      encoderPins,
      useLighting,
      lightingPin,
      lightingNumLeds,
      useLcd,
    } = data;
    return {
      baseFirmwareType,
      useBoardLedsProMicroAvr,
      useBoardLedsProMicroRp,
      useBoardLedsRpiPico,
      useDebugUart,
      useMatrixKeyScanner,
      useDirectWiredKeyScanner,
      useEncoder,
      useLighting,
      useLcd,
      matrixRowPins: (useMatrixKeyScanner && matrixRowPins) || undefined,
      matrixColumnPins: (useMatrixKeyScanner && matrixColumnPins) || undefined,
      directWiredPins:
        (useDirectWiredKeyScanner && directWiredPins) || undefined,
      encoderPins: (useEncoder && encoderPins) || undefined,
      lightingPin: (useLighting && lightingPin) || undefined,
      lightingNumLeds: useLighting ? lightingNumLeds : undefined,
    };
  },
  fixEditValuesOnModify(
    editValues: IKermiteStandardKeyboardSpec,
    diff: Partial<IKermiteStandardKeyboardSpec>,
  ) {
    const { baseFirmwareType: fw } = editValues;
    const isAvr = fw === 'AvrSplit' || fw === 'AvrUnified';
    const isRp = fw === 'RpUnified' || fw === 'RpSplit';
    if (isAvr) {
      editValues.useBoardLedsProMicroRp = false;
      editValues.useBoardLedsRpiPico = false;
    }
    if (isRp) {
      editValues.useBoardLedsProMicroAvr = false;
    }
    if (diff.baseFirmwareType) {
      // editValues.matrixRowPins = undefined;
      // editValues.matrixColumnPins = undefined;
    }
    if (diff.useBoardLedsProMicroRp) {
      editValues.useBoardLedsRpiPico = false;
    }
    if (diff.useBoardLedsRpiPico) {
      editValues.useBoardLedsProMicroRp = false;
    }
  },
  validateEditValues(
    editValues: IStandardFirmwareEditValues,
  ): IStandardFirmwareEditErrors {
    const mcuType = standardFirmwareEditModelHelpers.getMcuType(
      editValues.baseFirmwareType,
    );
    const {
      matrixRowPins,
      matrixColumnPins,
      directWiredPins,
      encoderPins,
      lightingPin,
      lightingNumLeds,
    } = editValues;
    return {
      matrixRowPins:
        matrixRowPins && subHelpers.validatePins(matrixRowPins, mcuType),
      matrixColumnPins:
        matrixColumnPins && subHelpers.validatePins(matrixColumnPins, mcuType),
      directWiredPins:
        directWiredPins && subHelpers.validatePins(directWiredPins, mcuType),
      encoderPins:
        encoderPins &&
        (subHelpers.validatePins(encoderPins, mcuType) ||
          subHelpers.checkPinsCount(encoderPins, 2)),
      lightingPin: lightingPin && subHelpers.validatePin(lightingPin, mcuType),
      lightingNumLeds:
        (lightingNumLeds !== undefined &&
          subHelpers.checkNumberInRange(lightingNumLeds, 0, 256)) ||
        undefined,
    };
  },
  validateForSave(editValues: IStandardFirmwareEditValues): boolean {
    const {
      useMatrixKeyScanner,
      matrixRowPins,
      matrixColumnPins,
      useDirectWiredKeyScanner,
      directWiredPins,
      useEncoder,
      encoderPins,
      useLighting,
      lightingPin,
      lightingNumLeds,
    } = editValues;
    if (useMatrixKeyScanner && !(matrixRowPins && matrixColumnPins)) {
      return false;
    }
    if (useDirectWiredKeyScanner && !directWiredPins) {
      return false;
    }
    if (useEncoder && !encoderPins) {
      return false;
    }
    if (useLighting && !(lightingPin && lightingNumLeds !== undefined)) {
      return false;
    }
    return true;
  },
};
