import { flattenArray, generateNumberSequence } from '~/shared';

const availablePinsAvr = flattenArray(
  ['B', 'C', 'D', 'E', 'F', 'PB', 'PC', 'PD', 'PE', 'PF'].map((port) =>
    [0, 1, 2, 3, 4, 5, 6, 7].map((idx) => port + idx),
  ),
);

const availablePinsRp = generateNumberSequence(29).map((i) => 'GP' + i);

export const firmwareEditModelHelpers = {
  validatePins(pins: string[] | undefined, mcuType: 'avr' | 'rp'): boolean {
    const availablePins =
      mcuType === 'avr' ? availablePinsAvr : availablePinsRp;
    return pins?.every((pin) => availablePins.includes(pin)) || false;
  },
};
