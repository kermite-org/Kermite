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
  const { placementOrigin, invertX, invertY } = layoutOptions;
  const isCentered = placementOrigin === 'center';
  if (isCentered) {
    design.setup.placementAnchor = 'center';
  }

  if (!isSplit) {
    if (
      spec.useMatrixKeyScanner &&
      spec.matrixRowPins &&
      spec.matrixColumnPins
    ) {
      const nx = spec.matrixColumnPins.length;
      const ny = spec.matrixRowPins.length;
      const num = nx * ny;
      let ox = 0;
      let oy = 0;
      if (isCentered) {
        ox = -nx / 2 + 0.5;
        oy = -ny / 2 + 0.5;
      }
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
            x: ox + ix,
            y: oy + iy,
            keyIndex: idx,
          };
        });
      design.keyEntities.push(...keys);
    }
  }
  return DisplayKeyboardDesignLoader.loadDisplayKeyboardDesign(design);
}
