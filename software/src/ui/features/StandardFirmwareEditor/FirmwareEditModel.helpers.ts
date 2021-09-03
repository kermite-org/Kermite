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

export const firmwareEditModelHelpers = {
  validatePins,
  cleanupSavingFirmwareConfig,
};
