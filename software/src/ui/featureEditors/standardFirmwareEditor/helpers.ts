import {
  checkArrayItemsUnique,
  generateNumberSequence,
  getObjectKeys,
  IStandardFirmwareConfig,
  isNumberInRange,
  IStandardBaseFirmwareType,
  isIncluded,
  compareArray,
} from '~/shared';
import {
  IMultiplePinsFieldKey,
  ISinglePinFieldKey,
  IStandardFirmwareEditErrors,
  IStandardFirmwareEditValues,
  IStandardFirmwareMcuType,
} from '~/ui/featureEditors/standardFirmwareEditor/types';

const availablePinsRp = generateNumberSequence(30).map((i) => 'GP' + i);

const availablePinsAll = availablePinsRp;

const subHelpers = {
  validatePin(
    pin: string,
    _mcuType: IStandardFirmwareMcuType,
  ): string | undefined {
    const availablePins = availablePinsRp;
    const valid = availablePins.includes(pin);
    if (!valid) {
      return `invalid pin specification`;
    }
  },
  validatePins(
    pins: string[],
    _mcuType: IStandardFirmwareMcuType,
  ): string | undefined {
    const availablePins = availablePinsRp;
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
  autoFixPin(pin: string): string {
    const valid = availablePinsAll.includes(pin);
    if (!valid) {
      const candidates = [
        pin.replace(/['"]/g, ''),
        `P${pin}`,
        pin.toUpperCase(),
        `P${pin}`.toUpperCase(),
      ];
      for (const candidate of candidates) {
        if (availablePinsAll.includes(candidate)) {
          return candidate;
        }
      }
    }
    return pin;
  },
  autoFixPins(pins: string[]): string[] {
    const valid = pins.every((pin) => availablePinsAll.includes(pin)) || false;
    if (!valid) {
      const fixedPins = pins.map((pin) => subHelpers.autoFixPin(pin));
      if (!compareArray(pins, fixedPins)) {
        return fixedPins;
      }
    }
    return pins;
  },
};

export const standardFirmwareEditModelHelpers = {
  getMcuType(
    baseFirmwareType: IStandardBaseFirmwareType,
  ): IStandardFirmwareMcuType {
    if (
      baseFirmwareType === 'RpUnified' ||
      baseFirmwareType === 'RpSplit' ||
      baseFirmwareType === 'RpOddSplit'
    ) {
      return 'rp';
    }
    throw new Error(`invalid baseFirmwareType ${baseFirmwareType}`);
  },
  getIsSplit(baseFirmwareType: IStandardBaseFirmwareType): boolean {
    return baseFirmwareType === 'RpSplit' || baseFirmwareType === 'RpOddSplit';
  },
  getIsOddSplit(baseFirmwareType: IStandardBaseFirmwareType): boolean {
    return baseFirmwareType === 'RpOddSplit';
  },
  cleanupFirmwareConfig(
    data: IStandardFirmwareConfig,
  ): IStandardFirmwareConfig {
    getObjectKeys(data).forEach((key) => {
      const value = data[key];
      if (value === false || (Array.isArray(value) && value.length === 0)) {
        delete data[key];
      }
    });
    const {
      baseFirmwareType,
      boardType,
      useBoardLeds,
      useDebugUart,
      useMatrixKeyScanner,
      useDirectWiredKeyScanner,
      useEncoder,
      matrixRowPins,
      matrixColumnPins,
      directWiredPins,
      encoderPins,
      matrixRowPinsR,
      matrixColumnPinsR,
      directWiredPinsR,
      encoderPinsR,
      useLighting,
      lightingPin,
      lightingNumLeds,
      lightingNumLedsR,
      useLcd,
      singleWireSignalPin,
    } = data;

    const { getIsSplit, getIsOddSplit } = standardFirmwareEditModelHelpers;
    const isSplit = getIsSplit(baseFirmwareType);
    const isOddSplit = getIsOddSplit(baseFirmwareType);

    return {
      baseFirmwareType,
      boardType,
      useBoardLeds,
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
      matrixRowPinsR:
        (isOddSplit && useMatrixKeyScanner && matrixRowPinsR) || undefined,
      matrixColumnPinsR:
        (isOddSplit && useMatrixKeyScanner && matrixColumnPinsR) || undefined,
      directWiredPinsR:
        (isOddSplit && useDirectWiredKeyScanner && directWiredPinsR) ||
        undefined,
      encoderPinsR: (isOddSplit && useEncoder && encoderPinsR) || undefined,
      lightingPin: (useLighting && lightingPin) || undefined,
      lightingNumLeds: useLighting ? lightingNumLeds : undefined,
      lightingNumLedsR:
        isOddSplit && useLighting ? lightingNumLedsR : undefined,
      singleWireSignalPin: (isSplit && singleWireSignalPin) || undefined,
    };
  },
  fixEditValuesOnModify(
    editValues: IStandardFirmwareConfig,
    diff: Partial<IStandardFirmwareConfig>,
  ) {
    const { baseFirmwareType, boardType } = editValues;

    const { getMcuType } = standardFirmwareEditModelHelpers;
    const mcuType = getMcuType(baseFirmwareType);
    const isRp = mcuType === 'rp';

    if (isRp) {
      if (!isIncluded(boardType)('ChipRP2040', 'ProMicroRP2040', 'RpiPico')) {
        editValues.boardType = 'ProMicroRP2040';
      }
    }
    if (diff.baseFirmwareType) {
      // editValues.matrixRowPins = undefined;
      // editValues.matrixColumnPins = undefined;
    }
    if (isRp && !editValues.useLighting && editValues.lightingPin === 'PD3') {
      editValues.lightingPin = undefined;
    }
    const isChip = isIncluded(editValues.boardType)('ChipRP2040');
    if (isChip && editValues.useBoardLeds) {
      editValues.useBoardLeds = false;
    }

    function fixPin<K extends ISinglePinFieldKey>(key: K) {
      const diffValue = diff[key];
      if (diffValue) {
        editValues[key] = subHelpers.autoFixPin(diffValue) as any;
      }
    }
    function fixPins<K extends IMultiplePinsFieldKey>(key: K) {
      const diffValue = diff[key];
      if (diffValue) {
        editValues[key] = subHelpers.autoFixPins(diffValue);
      }
    }
    fixPins('matrixRowPins');
    fixPins('matrixColumnPins');
    fixPins('matrixColumnPinsR');
    fixPins('matrixColumnPinsR');
    fixPins('directWiredPins');
    fixPins('directWiredPinsR');
    fixPins('encoderPins');
    fixPins('encoderPinsR');
    fixPin('lightingPin');
    fixPin('singleWireSignalPin');
  },
  validateEditValues(
    editValues: IStandardFirmwareEditValues,
  ): IStandardFirmwareEditErrors {
    const { getMcuType, getIsSplit } = standardFirmwareEditModelHelpers;

    const {
      baseFirmwareType,
      useMatrixKeyScanner,
      useDirectWiredKeyScanner,
      useEncoder,
      useLighting,
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

    const checkPins = (
      enabled: boolean | undefined,
      pins: string[] | undefined,
    ) =>
      (enabled && pins && subHelpers.validatePins(pins, mcuType)) || undefined;

    const checkEncoderPins = (pins: string[] | undefined) =>
      (useEncoder &&
        pins &&
        (subHelpers.validatePins(pins, mcuType) ||
          subHelpers.checkPinsCountEx(pins, allowedEncoderPinCounts))) ||
      undefined;

    const checkNumLeds = (numLeds: number | undefined) =>
      (useLighting &&
        numLeds !== undefined &&
        subHelpers.checkNumberInRange(numLeds, 1, 256)) ||
      undefined;

    return {
      matrixRowPins: checkPins(useMatrixKeyScanner, matrixRowPins),
      matrixColumnPins: checkPins(useMatrixKeyScanner, matrixColumnPins),
      directWiredPins: checkPins(useDirectWiredKeyScanner, directWiredPins),
      encoderPins: checkEncoderPins(encoderPins),

      matrixRowPinsR: checkPins(useMatrixKeyScanner, matrixRowPinsR),
      matrixColumnPinsR: checkPins(useMatrixKeyScanner, matrixColumnPinsR),
      directWiredPinsR: checkPins(useDirectWiredKeyScanner, directWiredPinsR),
      encoderPinsR: checkEncoderPins(encoderPinsR),

      lightingPin: lightingPin && subHelpers.validatePin(lightingPin, mcuType),
      lightingNumLeds: checkNumLeds(lightingNumLeds),
      lightingNumLedsR: checkNumLeds(lightingNumLedsR),

      singleWireSignalPin:
        singleWireSignalPin &&
        subHelpers.validatePin(singleWireSignalPin, mcuType),
    };
  },
  getTotalValidationError(editValues: IStandardFirmwareEditValues): string {
    const {
      baseFirmwareType,
      useMatrixKeyScanner,
      matrixRowPins,
      matrixColumnPins,
      matrixRowPinsR,
      matrixColumnPinsR,
      useDirectWiredKeyScanner,
      directWiredPins,
      directWiredPinsR,
      useEncoder,
      encoderPins,
      encoderPinsR,
      useLighting,
      lightingPin,
      lightingNumLeds,
      lightingNumLedsR,
      singleWireSignalPin,
    } = editValues;

    const { getIsSplit, getIsOddSplit } = standardFirmwareEditModelHelpers;
    const isSplit = getIsSplit(baseFirmwareType);
    const isOddSplit = getIsOddSplit(baseFirmwareType);

    if (isSplit && !singleWireSignalPin) {
      return 'single wire signal pin should be specified';
    }

    if (!isOddSplit) {
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
    } else {
      if (
        useMatrixKeyScanner &&
        !(
          (matrixRowPins && matrixColumnPins) ||
          (matrixRowPinsR && matrixColumnPinsR)
        )
      ) {
        return 'matrix pins should be specified';
      }
      if (useDirectWiredKeyScanner && !(directWiredPins || directWiredPinsR)) {
        return 'direct wired pins should be specified';
      }
      if (useEncoder && !(encoderPins || encoderPinsR)) {
        return 'encoder pins should be specified';
      }
      if (
        useLighting &&
        !(
          lightingPin &&
          (lightingNumLeds !== undefined || lightingNumLedsR !== undefined)
        )
      ) {
        return 'lighting pin and num LEDs should be specified';
      }
    }
    const allPins = [
      ...((useMatrixKeyScanner && matrixRowPins) || []),
      ...((useMatrixKeyScanner && matrixColumnPins) || []),
      ...((useDirectWiredKeyScanner && directWiredPins) || []),
      ...((useEncoder && encoderPins) || []),
      ...((useLighting && lightingPin && [lightingPin]) || []),
      ...((isSplit && singleWireSignalPin && [singleWireSignalPin]) || []),
    ];
    if (!checkArrayItemsUnique(allPins)) {
      return 'pin duplication detected';
    }
    const allPinsR = [
      ...((useMatrixKeyScanner && matrixRowPinsR) || []),
      ...((useMatrixKeyScanner && matrixColumnPinsR) || []),
      ...((useDirectWiredKeyScanner && directWiredPinsR) || []),
      ...((useEncoder && encoderPinsR) || []),
      ...((useLighting && lightingPin && [lightingPin]) || []),
      ...((isSplit && singleWireSignalPin && [singleWireSignalPin]) || []),
    ];
    if (!checkArrayItemsUnique(allPinsR)) {
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
