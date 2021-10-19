import {
  createFallbackPersistKeyboardDesign,
  generateNumberSequence,
  IKermiteStandardKeyboardSpec,
  IPersistKeyboardDesign,
  IPersistKeyboardDesignRealKeyEntity,
  IStandardBaseFirmwareType,
} from '~/shared';
import { appUi } from '~/ui/base';
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
  numKeys: number,
  nx: number,
  offsetX: number,
  offsetY: number,
  invertX: boolean,
  invertY: boolean,
  keyIndexOffset: number,
): IPersistKeyboardDesignRealKeyEntity[] {
  const ny = Math.ceil(numKeys / nx);
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
  return generateNumberSequence(numKeys).map((i) => {
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

const splitXOffset = 0.5;

function keyPlacer_placeUnifiedKeyboardKeys(
  spec: IKermiteStandardKeyboardSpec,
  layoutOptions: ILayoutGeneratorOptions,
  design: IPersistKeyboardDesign,
) {
  const { placementOrigin, invertX, invertY } = layoutOptions;
  const isCentered = placementOrigin === 'center';

  let keyIndexBase = 0;
  let baseY = 0;
  if (spec.useMatrixKeyScanner && spec.matrixRowPins && spec.matrixColumnPins) {
    const nx = spec.matrixColumnPins.length;
    const ny = spec.matrixRowPins.length;
    const numKeys = nx * ny;
    let offsetX = 0;
    let offsetY = 0;
    if (isCentered) {
      offsetX = -nx / 2 + 0.5;
      offsetY = -ny / 2 + 0.5;
    }
    const keys = makeMatrixKeyEntities(
      numKeys,
      nx,
      offsetX,
      offsetY,
      invertX,
      invertY,
      0,
    );
    design.keyEntities.push(...keys);
    keyIndexBase += keys.length;
    baseY += ny;
  }
  if (appUi.isDevelopment) {
    if (spec.useDirectWiredKeyScanner && spec.directWiredPins) {
      const numKeys = spec.directWiredPins.length;
      const nx = 4;
      const ny = Math.ceil(numKeys / nx);
      let offsetX = 0;
      let offsetY = 0;
      if (isCentered) {
        offsetX = -nx / 2 + 0.5;
        offsetY = -ny / 2 + 0.5;
      }
      const keys = makeMatrixKeyEntities(
        numKeys,
        nx,
        offsetX,
        baseY + offsetY,
        invertX,
        invertY,
        keyIndexBase,
      );
      design.keyEntities.push(...keys);
      keyIndexBase += keys.length;
    }
  }
}

function keyPlacer_placeEvenSplitKeyboardKeys(
  spec: IKermiteStandardKeyboardSpec,
  layoutOptions: ILayoutGeneratorOptions,
  design: IPersistKeyboardDesign,
) {
  const { placementOrigin, invertX, invertY } = layoutOptions;
  const isCentered = placementOrigin === 'center';
  if (spec.useMatrixKeyScanner && spec.matrixRowPins && spec.matrixColumnPins) {
    const nx = spec.matrixColumnPins.length;
    const ny = spec.matrixRowPins.length;
    const numKeys = nx * ny;
    let offsetXL = 0;
    let offsetXR = splitXOffset * 2 + nx;
    let offsetY = 0;
    if (isCentered) {
      offsetXL = -nx - splitXOffset + 0.5;
      offsetXR = splitXOffset + 0.5;
      offsetY = -ny / 2 + 0.5;
    }
    const keysLeft = makeMatrixKeyEntities(
      numKeys,
      nx,
      offsetXL,
      offsetY,
      !invertX,
      invertY,
      0,
    );
    const keysRight = makeMatrixKeyEntities(
      numKeys,
      nx,
      offsetXR,
      offsetY,
      invertX,
      invertY,
      nx * ny,
    );
    design.keyEntities.push(...keysLeft);
    design.keyEntities.push(...keysRight);
  }
}

function keyPlacer_placeOddSplitKeyboardKeys(
  spec: IKermiteStandardKeyboardSpec,
  layoutOptions: ILayoutGeneratorOptions,
  design: IPersistKeyboardDesign,
) {
  const { placementOrigin, invertX, invertXR, invertY } = layoutOptions;
  const isCentered = placementOrigin === 'center';
  if (spec.useMatrixKeyScanner) {
    const nxl = spec.matrixColumnPins?.length || 0;
    const nyl = spec.matrixRowPins?.length || 0;
    const numKeysL = nxl * nyl;
    const nxr = spec.matrixColumnPinsR?.length || 0;
    const nyr = spec.matrixRowPinsR?.length || 0;
    const numKeysR = nxr * nyr;
    let offsetXL = 0;
    let offsetXR = splitXOffset * 2 + nxl;
    let offsetYL = 0;
    let offsetYR = 0;
    if (isCentered) {
      offsetXL = -nxl - splitXOffset + 0.5;
      offsetXR = splitXOffset + 0.5;
      offsetYL = -nyr / 2 + 0.5;
      offsetYR = -nyr / 2 + 0.5;
    }
    const keysLeft = makeMatrixKeyEntities(
      numKeysL,
      nxl,
      offsetXL,
      offsetYL,
      !invertX,
      invertY,
      0,
    );
    const keysRight = makeMatrixKeyEntities(
      numKeysR,
      nxr,
      offsetXR,
      offsetYR,
      invertXR,
      invertY,
      nxl * nyl,
    );
    design.keyEntities.push(...keysLeft);
    design.keyEntities.push(...keysRight);
  }
}

export function createLayoutFromFirmwareSpec(
  spec: IKermiteStandardKeyboardSpec,
  layoutOptions: ILayoutGeneratorOptions,
): IPersistKeyboardDesign {
  const design = createFallbackPersistKeyboardDesign();
  const isUnified = unifiedKeyboardTypes.includes(spec.baseFirmwareType);
  const isEvenSplit = evenSplitKeyboardTypes.includes(spec.baseFirmwareType);
  const isOddSplit = oddSplitKeyboardTypes.includes(spec.baseFirmwareType);
  const { placementOrigin } = layoutOptions;
  const isCentered = placementOrigin === 'center';
  if (isCentered) {
    design.setup.placementAnchor = 'center';
  }
  if (isUnified) {
    keyPlacer_placeUnifiedKeyboardKeys(spec, layoutOptions, design);
  } else if (isEvenSplit) {
    keyPlacer_placeEvenSplitKeyboardKeys(spec, layoutOptions, design);
  } else if (isOddSplit) {
    keyPlacer_placeOddSplitKeyboardKeys(spec, layoutOptions, design);
  }
  return design;
}
