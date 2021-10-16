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

const unifiedKeyboardTypes: IStandardBaseFirmwareType[] = [
  'AvrUnified',
  'RpUnified',
];

const evenSplitKeyboardTypes: IStandardBaseFirmwareType[] = [
  'AvrSplit',
  'RpSplit',
];

const oddSplitKeyboardTypes: IStandardBaseFirmwareType[] = [
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

function makeMatrixKeyEntitiesW(
  nx: number,
  ny: number,
  offsetX: number,
  offsetY: number,
  isCentered: boolean,
  invertX: boolean,
  invertY: boolean,
  keyIndexOffset: number,
) {
  const xs = generateNumberSequence(nx);
  const ys = generateNumberSequence(ny);
  shiftNumbers(xs, offsetX);
  shiftNumbers(ys, offsetY);
  if (invertX) {
    xs.reverse();
  }
  if (invertY) {
    ys.reverse();
  }
  return makeMatrixKeyEntities(xs, ys, keyIndexOffset);
}

export function createLayoutFromFirmwareSpec(
  spec: IKermiteStandardKeyboardSpec,
  layoutOptions: ILayoutGeneratorOptions,
): IDisplayKeyboardDesign {
  const design = createFallbackPersistKeyboardDesign();
  const isUnified = unifiedKeyboardTypes.includes(spec.baseFirmwareType);
  const isEvenSplit = evenSplitKeyboardTypes.includes(spec.baseFirmwareType);
  const isOddSplit = oddSplitKeyboardTypes.includes(spec.baseFirmwareType);

  const { placementOrigin, invertX, invertY } = layoutOptions;
  const isTopLeft = placementOrigin === 'topLeft';
  const isCentered = placementOrigin === 'center';
  if (isCentered) {
    design.setup.placementAnchor = 'center';
  }
  const splitXOffset = 1;

  if (isUnified) {
    if (
      spec.useMatrixKeyScanner &&
      spec.matrixRowPins &&
      spec.matrixColumnPins
    ) {
      const nx = spec.matrixColumnPins.length;
      const ny = spec.matrixRowPins.length;
      let offsetX = 0;
      let offsetY = 0;
      if (isCentered) {
        offsetX = -nx / 2 + 0.5;
        offsetY = -ny / 2 + 0.5;
      }
      const keys = makeMatrixKeyEntitiesW(
        nx,
        ny,
        offsetX,
        offsetY,
        isCentered,
        invertX,
        invertY,
        0,
      );
      design.keyEntities.push(...keys);
    }
  } else if (isEvenSplit) {
    if (
      spec.useMatrixKeyScanner &&
      spec.matrixRowPins &&
      spec.matrixColumnPins
    ) {
      const nx = spec.matrixColumnPins.length;
      const ny = spec.matrixRowPins.length;

      let offsetXL = -nx - splitXOffset;
      let offsetXR = splitXOffset;
      let offsetY = 0;

      if (isCentered) {
        offsetXL = -nx - 0.5;
        offsetXR = 1.5;
        offsetY = -ny / 2 + 0.5;
      }

      const keysLeft = makeMatrixKeyEntitiesW(
        nx,
        ny,
        offsetXL,
        offsetY,
        isCentered,
        !invertX,
        invertY,
        0,
      );
      const keysRight = makeMatrixKeyEntitiesW(
        nx,
        ny,
        offsetXR,
        offsetY,
        isCentered,
        invertX,
        invertY,
        nx * ny,
      );
      design.keyEntities.push(...keysLeft);
      design.keyEntities.push(...keysRight);
    }
  }
  return DisplayKeyboardDesignLoader.loadDisplayKeyboardDesign(design);
}
