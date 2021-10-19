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
  isCentered: boolean,
): IPersistKeyboardDesignRealKeyEntity[] {
  const ny = Math.ceil(numKeys / nx);
  const xs = generateNumberSequence(nx);
  const ys = generateNumberSequence(ny);
  if (isCentered) {
    offsetX += -nx / 2 + 0.5;
    offsetY += -ny / 2 + 0.5;
  }
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
  let matrixPartHeight = 0;
  if (spec.useMatrixKeyScanner && spec.matrixRowPins && spec.matrixColumnPins) {
    const nx = spec.matrixColumnPins.length;
    const ny = spec.matrixRowPins.length;
    const keys = makeMatrixKeyEntities(
      nx * ny,
      nx,
      0,
      0,
      invertX,
      invertY,
      0,
      isCentered,
    );
    design.keyEntities.push(...keys);
    keyIndexBase += keys.length;
    matrixPartHeight += ny;
  }
  if (appUi.isDevelopment) {
    if (spec.useDirectWiredKeyScanner && spec.directWiredPins) {
      const numKeys = spec.directWiredPins.length;
      const nx = 4;
      const ny = Math.ceil(numKeys / nx);
      let offsetY = 0;
      if (!isCentered) {
        offsetY = matrixPartHeight;
      } else {
        const dwPartHeight = ny;
        offsetY = (matrixPartHeight + dwPartHeight) / 2;
      }
      const keys = makeMatrixKeyEntities(
        numKeys,
        nx,
        0,
        offsetY,
        invertX,
        invertY,
        keyIndexBase,
        isCentered,
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
    if (isCentered) {
      const d = nx / 2 + splitXOffset;
      offsetXL = -d;
      offsetXR = d;
    }
    const keysLeft = makeMatrixKeyEntities(
      numKeys,
      nx,
      offsetXL,
      0,
      !invertX,
      invertY,
      0,
      isCentered,
    );
    const keysRight = makeMatrixKeyEntities(
      numKeys,
      nx,
      offsetXR,
      0,
      invertX,
      invertY,
      nx * ny,
      isCentered,
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
    if (isCentered) {
      offsetXL = -nxl / 2 - splitXOffset;
      offsetXR = nxr / 2 + splitXOffset;
    }
    const keysLeft = makeMatrixKeyEntities(
      numKeysL,
      nxl,
      offsetXL,
      0,
      !invertX,
      invertY,
      0,
      isCentered,
    );
    const keysRight = makeMatrixKeyEntities(
      numKeysR,
      nxr,
      offsetXR,
      0,
      invertXR,
      invertY,
      nxl * nyl,
      isCentered,
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
