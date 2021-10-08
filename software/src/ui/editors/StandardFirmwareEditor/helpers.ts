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

const acceptableAvrSingleWirePins = ['PD0', 'PD2'];

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
  validateAvrEncoderPrimaryPins(
    pins: string[],
    mcuType: IStandardFirmwareMcuType,
  ): string | undefined {
    if (mcuType === 'avr') {
      const numEncoder = pins.length / 2;
      const checkedPins = generateNumberSequence(numEncoder).map(
        (i) => pins[i * 2],
      );
      const valid = checkedPins.every((pin) =>
        acceptableAvrEncoderPrimaryPins.includes(pin),
      );
      if (!valid) {
        return `primary pin for encoder must be PB0~PB7`;
      }
    }
  },
  validateAvrSingleWireSignalPin(
    pin: string,
    mcuType: IStandardFirmwareMcuType,
  ): string | undefined {
    if (mcuType === 'avr') {
      const valid = acceptableAvrSingleWirePins.includes(pin);
      if (!valid) {
        return `signal pin must be PD0 or PD2`;
      }
    }
  },
  checkPinsCount(pins: string[], expectedLength: number): string | undefined {
    if (pins.length !== expectedLength) {
      return `number of pins should be ${expectedLength}`;
    }
  },
  checkPinsCountEx(
    pins: string[],
    expectedLengths: number[],
  ): string | undefined {
    if (!expectedLengths.some((it) => it === pins.length)) {
      return `number of pins should be ${expectedLengths.join(',')}`;
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
    if (
      baseFirmwareType === 'AvrUnified' ||
      baseFirmwareType === 'AvrSplit' ||
      baseFirmwareType === 'AvrOddSplit'
    ) {
      return 'avr';
    } else if (
      baseFirmwareType === 'RpUnified' ||
      baseFirmwareType === 'RpSplit' ||
      baseFirmwareType === 'RpOddSplit'
    ) {
      return 'rp';
    }
    throw new Error(`invalid baseFirmwareType ${baseFirmwareType}`);
  },
  getIsSplit(baseFirmwareType: IStandardBaseFirmwareType): boolean {
    // return baseFirmwareType === 'AvrSplit' || baseFirmwareType === 'RpSplit';
    return (
      baseFirmwareType === 'AvrSplit' ||
      baseFirmwareType === 'RpSplit' ||
      baseFirmwareType === 'AvrOddSplit' ||
      baseFirmwareType === 'RpOddSplit'
    );
  },
  getIsOddSplit(baseFirmwareType: IStandardBaseFirmwareType): boolean {
    return (
      baseFirmwareType === 'AvrOddSplit' || baseFirmwareType === 'RpOddSplit'
    );
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
      singleWireSignalPin,
    } = data;
    const isSplit =
      baseFirmwareType === 'AvrSplit' || baseFirmwareType === 'RpSplit';
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
      singleWireSignalPin: (isSplit && singleWireSignalPin) || undefined,
    };
  },
  fixEditValuesOnModify(
    editValues: IKermiteStandardKeyboardSpec,
    diff: Partial<IKermiteStandardKeyboardSpec>,
  ) {
    const { baseFirmwareType: fw } = editValues;
    const isAvr = fw === 'AvrUnified' || fw === 'AvrSplit' || 'AvrOddSplit';
    const isRp = fw === 'RpUnified' || fw === 'RpSplit' || 'RpOddSplit';
    const isSplit =
      fw === 'AvrSplit' ||
      fw === 'RpSplit' ||
      fw === 'AvrOddSplit' ||
      fw === 'RpOddSplit';
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
    if (isAvr && isSplit) {
      editValues.useLcd = false;
    }
  },
  validateEditValues(
    editValues: IStandardFirmwareEditValues,
  ): IStandardFirmwareEditErrors {
    const { getMcuType, getIsSplit } = standardFirmwareEditModelHelpers;

    const {
      baseFirmwareType,
      matrixRowPins,
      matrixColumnPins,
      directWiredPins,
      encoderPins,
      matrixRowPinsR,
      matrixColumnPinsR,
      directWiredPinsR,
      encoderPinsR,
      lightingPin,
      lightingNumLeds,
      lightingNumLedsR,
      singleWireSignalPin,
    } = editValues;

    const mcuType = getMcuType(baseFirmwareType);
    const isSplit = getIsSplit(baseFirmwareType);

    const allowedEncoderPinCounts = isSplit ? [2] : [2, 4, 6];

    const checkPins = (pins: string[] | undefined) =>
      pins && subHelpers.validatePins(pins, mcuType);

    const checkEncoderPins = (pins: string[] | undefined) =>
      pins &&
      (subHelpers.validatePins(pins, mcuType) ||
        subHelpers.checkPinsCountEx(pins, allowedEncoderPinCounts) ||
        subHelpers.validateAvrEncoderPrimaryPins(pins, mcuType));

    const checkNumLeds = (numLeds: number | undefined) =>
      (numLeds !== undefined &&
        subHelpers.checkNumberInRange(numLeds, 1, 256)) ||
      undefined;

    return {
      matrixRowPins: checkPins(matrixRowPins),
      matrixColumnPins: checkPins(matrixColumnPins),
      directWiredPins: checkPins(directWiredPins),
      encoderPins: checkEncoderPins(encoderPins),

      matrixRowPinsR: checkPins(matrixRowPinsR),
      matrixColumnPinsR: checkPins(matrixColumnPinsR),
      directWiredPinsR: checkPins(directWiredPinsR),
      encoderPinsR: checkEncoderPins(encoderPinsR),

      lightingPin: lightingPin && subHelpers.validatePin(lightingPin, mcuType),
      lightingNumLeds: checkNumLeds(lightingNumLeds),
      lightingNumLedsR: checkNumLeds(lightingNumLedsR),

      singleWireSignalPin:
        singleWireSignalPin &&
        (subHelpers.validatePin(singleWireSignalPin, mcuType) ||
          subHelpers.validateAvrSingleWireSignalPin(
            singleWireSignalPin,
            mcuType,
          )),
    };
  },
  getTotalValidationError(editValues: IStandardFirmwareEditValues): string {
    const {
      baseFirmwareType,
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
      singleWireSignalPin,
    } = editValues;

    const isSplit =
      baseFirmwareType === 'AvrSplit' || baseFirmwareType === 'RpSplit';

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
    if (isSplit && !singleWireSignalPin) {
      return 'single wire signal pin should be specified';
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
