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

function shiftNumbers(arr: number[], offset: number) {
  for (let i = 0; i < arr.length; i++) {
    arr[i] += offset;
  }
}

function makeMatrixKeyEntities(
  xs: number[],
  ys: number[],
  keyIndexOffset: number,
): IPersistKeyboardDesignRealKeyEntity[] {
  const nx = xs.length;
  const ny = ys.length;
  const num = nx * ny;
  return generateNumberSequence(num).map((i) => {
    const ix = i % nx >> 0;
    const iy = (i / nx) >> 0;
    const keyIndex = keyIndexOffset + i;
    return {
      keyId: `key${keyIndex}`,
      x: xs[ix],
      y: ys[iy],
      keyIndex,
    };
  });
}
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
      const xs = generateNumberSequence(nx);
      const ys = generateNumberSequence(ny);
      if (invertX) {
        xs.reverse();
      }
      if (invertY) {
        ys.reverse();
      }
      if (isCentered) {
        shiftNumbers(xs, -nx / 2 + 0.5);
        shiftNumbers(ys, -ny / 2 + 0.5);
      }
      const keys = makeMatrixKeyEntities(xs, ys, 0);
      design.keyEntities.push(...keys);
    }
  }
  return DisplayKeyboardDesignLoader.loadDisplayKeyboardDesign(design);
}
