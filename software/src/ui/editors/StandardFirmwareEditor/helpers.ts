import {
  checkArrayItemsUnique,
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
} from '~/ui/editors/StandardFirmwareEditor/types';

const availablePinsAvr = flattenArray(
  ['PB', 'PC', 'PD', 'PE', 'PF'].map((port) =>
    [0, 1, 2, 3, 4, 5, 6, 7].map((idx) => port + idx),
  ),
);
const acceptableAvrEncoderPrimaryPins = [0, 1, 2, 3, 4, 5, 6, 7].map(
  (idx) => 'PB' + idx,
);

const availablePinsRp = generateNumberSequence(30).map((i) => 'GP' + i);

const subHelpers = {
  validatePin(
    pin: string,
    mcuType: IStandardFirmwareMcuType,
  ): string | undefined {
    const availablePins =
      mcuType === 'avr' ? availablePinsAvr : availablePinsRp;
    const valid = availablePins.includes(pin);
    if (!valid) {
      return `invalid pin specification`;
    }
  },
  validatePins(
    pins: string[],
    mcuType: IStandardFirmwareMcuType,
  ): string | undefined {
    const availablePins =
      mcuType === 'avr' ? availablePinsAvr : availablePinsRp;
    const valid = pins.every((pin) => availablePins.includes(pin)) || false;
    if (!valid) {
      return `invalid pins specification`;
    }
  },
  validateAvrEncoderPrimaryPin(
    pin: string,
    mcuType: IStandardFirmwareMcuType,
  ): string | undefined {
    if (mcuType === 'avr') {
      const valid = acceptableAvrEncoderPrimaryPins.includes(pin);
      if (!valid) {
        return `primary pin for encoder must be PB0~PB7`;
      }
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
    if (isAvr && editValues.useLighting) {
      editValues.lightingPin = 'PD3';
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
          subHelpers.checkPinsCount(encoderPins, 2) ||
          subHelpers.validateAvrEncoderPrimaryPin(encoderPins[0], mcuType)),
      lightingPin: lightingPin && subHelpers.validatePin(lightingPin, mcuType),
      lightingNumLeds:
        (lightingNumLeds !== undefined &&
          subHelpers.checkNumberInRange(lightingNumLeds, 1, 256)) ||
        undefined,
    };
  },
  getTotalValidationError(editValues: IStandardFirmwareEditValues): string {
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
      return 'matrix pins should be specified';
    }
    if (useDirectWiredKeyScanner && !directWiredPins) {
      return 'direct wired pins should be specified';
    }
    if (useEncoder && !encoderPins) {
      return 'encoder pins should be specified';
    }
    if (useLighting && !(lightingPin && lightingNumLeds !== undefined)) {
      return 'lighting pin and num LEDs should be specified';
    }
    const allPins = [
      ...((useMatrixKeyScanner && matrixRowPins) || []),
      ...((useMatrixKeyScanner && matrixColumnPins) || []),
      ...((useDirectWiredKeyScanner && directWiredPins) || []),
      ...((useEncoder && encoderPins) || []),
      ...((useLighting && lightingPin && [lightingPin]) || []),
    ];
    if (!checkArrayItemsUnique(allPins)) {
      return 'pin duplication detected';
    }
    return '';
  },
};

export const standardFirmwareEditor_fieldValueConverters = {
  arrayToText(arr: string[] | undefined): string {
    return arr?.join(', ') || '';
  },
  arrayFromText(text: string): string[] | undefined {
    if (text === '') {
      return undefined;
    }
    return text.split(',').map((a) => a.trim());
  },
  integerToText(value: number | undefined): string {
    return value?.toString() || '';
  },
  integerFromText(text: string): number | undefined {
    const value = parseInt(text);
    return isFinite(value) ? value : undefined;
  },
};
