import {
  createFallbackPersistKeyboardDesign,
  DisplayKeyboardDesignLoader,
  generateNumberSequence,
  IDisplayKeyboardDesign,
  IKermiteStandardKeyboardSpec,
  IPersistKeyboardDesignRealKeyEntity,
  IStandardBaseFirmwareType,
} from '~/shared';

const splitKeyboardTypes: IStandardBaseFirmwareType[] = [
  'AvrSplit',
  'RpSplit',
  'AvrOddSplit',
  'RpOddSplit',
];

export function createLayoutFromFirmwareSpec(
  spec: IKermiteStandardKeyboardSpec,
): IDisplayKeyboardDesign {
  const design = createFallbackPersistKeyboardDesign();
  const isSplit = splitKeyboardTypes.includes(spec.baseFirmwareType);
  if (!isSplit) {
    if (
      spec.useMatrixKeyScanner &&
      spec.matrixRowPins &&
      spec.matrixColumnPins
    ) {
      const nx = spec.matrixColumnPins.length;
      const ny = spec.matrixRowPins.length;
      const num = nx * ny;
      const keys: IPersistKeyboardDesignRealKeyEntity[] =
        generateNumberSequence(num).map((idx) => {
          const ix = idx % nx >> 0;
          const iy = (idx / nx) >> 0;
          return {
            keyId: `key${idx}`,
            x: ix,
            y: iy,
            keyIndex: idx,
          };
        });
      design.keyEntities.push(...keys);
    }
  }
  return DisplayKeyboardDesignLoader.loadDisplayKeyboardDesign(design);
}
