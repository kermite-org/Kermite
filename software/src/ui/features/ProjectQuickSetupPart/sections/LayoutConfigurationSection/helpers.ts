import {
  createFallbackPersistKeyboardDesign,
  DisplayKeyboardDesignLoader,
  generateNumberSequence,
  IDisplayKeyboardDesign,
  IKermiteStandardKeyboardSpec,
  IPersistKeyboardDesignRealKeyEntity,
  IStandardBaseFirmwareType,
} from '~/shared';
import { ILayoutGeneratorOptions } from '~/ui/features/ProjectQuickSetupPart/ProjectQuickSetupPartTypes';

const splitKeyboardTypes: IStandardBaseFirmwareType[] = [
  'AvrSplit',
  'RpSplit',
  'AvrOddSplit',
  'RpOddSplit',
];

export function createLayoutFromFirmwareSpec(
  spec: IKermiteStandardKeyboardSpec,
  layoutOptions: ILayoutGeneratorOptions,
): IDisplayKeyboardDesign {
  const design = createFallbackPersistKeyboardDesign();
  const isSplit = splitKeyboardTypes.includes(spec.baseFirmwareType);
  const { invertX, invertY } = layoutOptions;
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
          let ix = idx % nx >> 0;
          let iy = (idx / nx) >> 0;
          if (invertX) {
            ix = nx - ix - 1;
          }
          if (invertY) {
            iy = ny - iy - 1;
          }
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
