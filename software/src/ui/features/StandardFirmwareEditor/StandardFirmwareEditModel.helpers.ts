import {
  duplicateObjectByJsonStringifyParse,
  flattenArray,
  generateNumberSequence,
  getObjectKeys,
  IKermiteStandardKeyboardSpec,
} from '~/shared';

const availablePinsAvr = flattenArray(
  ['B', 'C', 'D', 'E', 'F', 'PB', 'PC', 'PD', 'PE', 'PF'].map((port) =>
    [0, 1, 2, 3, 4, 5, 6, 7].map((idx) => port + idx),
  ),
);

const availablePinsRp = generateNumberSequence(29).map((i) => 'GP' + i);

function validatePins(
  pins: string[] | undefined,
  mcuType: 'avr' | 'rp',
): boolean {
  const availablePins = mcuType === 'avr' ? availablePinsAvr : availablePinsRp;
  return pins?.every((pin) => availablePins.includes(pin)) || false;
}

function cleanupSavingFirmwareConfig(
  sourceData: IKermiteStandardKeyboardSpec,
): IKermiteStandardKeyboardSpec {
  const data = duplicateObjectByJsonStringifyParse(sourceData);
  getObjectKeys(data).forEach((key) => {
    const value = data[key];
    if (value === false || (Array.isArray(value) && value.length === 0)) {
      delete data[key];
    }
  });
  return data;
}

function fixEditValuesOnModify(
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
}

export const standardFirmwareEditModelHelpers = {
  validatePins,
  cleanupSavingFirmwareConfig,
  fixEditValuesOnModify,
};
