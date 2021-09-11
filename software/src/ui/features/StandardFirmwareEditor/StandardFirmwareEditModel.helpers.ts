import {
  duplicateObjectByJsonStringifyParse,
  flattenArray,
  generateNumberSequence,
  getObjectKeys,
  IKermiteStandardKeyboardSpec,
  IStandardBaseFirmwareType,
} from '~/shared';
import { IStandardFirmwareMcuType } from '~/ui/features/StandardFirmwareEditor/types';

const availablePinsAvr = flattenArray(
  ['B', 'C', 'D', 'E', 'F', 'PB', 'PC', 'PD', 'PE', 'PF'].map((port) =>
    [0, 1, 2, 3, 4, 5, 6, 7].map((idx) => port + idx),
  ),
);
const availablePinsRp = generateNumberSequence(29).map((i) => 'GP' + i);

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
  validatePins(pins: string[] | undefined, mcuType: 'avr' | 'rp'): boolean {
    const availablePins =
      mcuType === 'avr' ? availablePinsAvr : availablePinsRp;
    return pins?.every((pin) => availablePins.includes(pin)) || false;
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
};
