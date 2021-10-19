import {
  createFallbackPersistKeyboardDesign,
  generateNumberSequence,
  IKermiteStandardKeyboardSpec,
  IPersistKeyboardDesign,
  IPersistKeyboardDesignRealKeyEntity,
  IStandardBaseFirmwareType,
  splitBytesN,
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

const splitXOffset = 1;

function makeMatrixKeyEntities(
  numKeys: number,
  nx: number,
  offsetY: number,
  invertIndicesX: boolean,
  invertIndicesY: boolean,
  keyIndexOffset: number,
  isSplit: boolean,
  dirX: number,
  dirY: number,
): IPersistKeyboardDesignRealKeyEntity[] {
  let offsetX = 0;
  if (isSplit) {
    offsetX += splitXOffset;
  }

  const rowIndices = splitBytesN(generateNumberSequence(numKeys), nx);
  if (invertIndicesX) {
    rowIndices.forEach((row) => row.reverse());
  }
  if (invertIndicesY) {
    rowIndices.reverse();
  }
  const indices = rowIndices.flat();

  return generateNumberSequence(numKeys).map((i) => {
    const ix = i % nx >> 0;
    const iy = (i / nx) >> 0;
    const keyIndex = keyIndexOffset + indices[i];
    return {
      keyId: `key${keyIndex}`,
      x: (offsetX + ix) * dirX,
      y: offsetY + iy * dirY,
      keyIndex,
    };
  });
}

function placeKeyEntitiesSet(
  design: IPersistKeyboardDesign,
  nxMatrixKeys: number,
  nyMatrixKeys: number,
  numDirectKeys: number,
  numEncoderKeys: number,
  wrapX: number,
  invertX: boolean,
  invertY: boolean,
  keyIndexBase: number,
  isSplit: boolean,
  dir: number,
) {
  let mainKeyBlockHeight = 0;
  if (nxMatrixKeys > 0 && nyMatrixKeys > 0) {
    const nx = nxMatrixKeys;
    const ny = nyMatrixKeys;
    const keys = makeMatrixKeyEntities(
      nx * ny,
      nx,
      0,
      invertX,
      invertY,
      keyIndexBase,
      isSplit,
      dir,
      1,
    );
    design.keyEntities.push(...keys);
    keyIndexBase += keys.length;
    mainKeyBlockHeight = ny;
  }
  if (numDirectKeys > 0) {
    const num = numDirectKeys;
    const nx = wrapX;
    const offsetY = mainKeyBlockHeight;
    const keys = makeMatrixKeyEntities(
      num,
      nx,
      offsetY,
      invertX,
      false,
      keyIndexBase,
      isSplit,
      dir,
      1,
    );
    design.keyEntities.push(...keys);
    keyIndexBase += keys.length;
    if (!mainKeyBlockHeight) {
      mainKeyBlockHeight = Math.ceil(num / nx);
    }
  }
  if (numEncoderKeys > 0) {
    const num = numEncoderKeys;
    const nx = wrapX;
    let offsetY = 0;
    if (mainKeyBlockHeight) {
      offsetY = -1;
    }
    const keys = makeMatrixKeyEntities(
      num,
      nx,
      offsetY,
      invertX,
      false,
      keyIndexBase,
      isSplit,
      dir,
      -1,
    );
    design.keyEntities.push(...keys);
    keyIndexBase += keys.length;
  }
}

type IPersistKeyboardDesignWithRealKeys = Omit<
  IPersistKeyboardDesign,
  'keyEntities'
> & {
  keyEntities: IPersistKeyboardDesignRealKeyEntity[];
};

function fixCoordOrigin(design: IPersistKeyboardDesign, isCentered: boolean) {
  const _design = design as IPersistKeyboardDesignWithRealKeys;
  const xs = _design.keyEntities.map((ke) => ke.x);
  const ys = _design.keyEntities.map((ke) => ke.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  let dx = 0;
  let dy = 0;
  if (!isCentered) {
    dx = -minX;
    dy = -minY;
  } else {
    const midX = (minX + maxX) / 2;
    const midY = (minY + maxY) / 2;
    dx = -midX;
    dy = -midY;
  }
  _design.keyEntities.forEach((ke) => {
    ke.x += dx;
    ke.y += dy;
  });
}

export function createLayoutFromFirmwareSpec(
  spec: IKermiteStandardKeyboardSpec,
  layoutOptions: ILayoutGeneratorOptions,
): IPersistKeyboardDesign {
  const design = createFallbackPersistKeyboardDesign();
  const { placementOrigin, invertX, invertXR, invertY } = layoutOptions;
  const isCentered = placementOrigin === 'center';
  if (isCentered) {
    design.setup.placementAnchor = 'center';
  }

  const isUnified = unifiedKeyboardTypes.includes(spec.baseFirmwareType);
  const isEvenSplit = evenSplitKeyboardTypes.includes(spec.baseFirmwareType);
  const isOddSplit = oddSplitKeyboardTypes.includes(spec.baseFirmwareType);

  const nxMatrixKeys =
    (spec.useMatrixKeyScanner && spec.matrixColumnPins?.length) || 0;
  const nyMatrixKeys =
    (spec.useMatrixKeyScanner && spec.matrixRowPins?.length) || 0;
  const numDirectKeys =
    (spec.useDirectWiredKeyScanner && spec.directWiredPins?.length) || 0;
  const wrapX = 4;
  const numEncoderKeys = (spec.useEncoder && spec.encoderPins?.length) || 0;

  const nxMatrixKeysR =
    (spec.useMatrixKeyScanner && spec.matrixColumnPinsR?.length) || 0;
  const nyMatrixKeysR =
    (spec.useMatrixKeyScanner && spec.matrixRowPinsR?.length) || 0;
  const numDirectKeysR =
    (spec.useDirectWiredKeyScanner && spec.directWiredPinsR?.length) || 0;
  const numEncoderKeysR = (spec.useEncoder && spec.encoderPinsR?.length) || 0;

  const keyIndexBaseL = 0;
  const keyIndexBaseR =
    nxMatrixKeys * nyMatrixKeys + numDirectKeys + numEncoderKeys;

  if (isUnified) {
    placeKeyEntitiesSet(
      design,
      nxMatrixKeys,
      nyMatrixKeys,
      numDirectKeys,
      numEncoderKeys,
      wrapX,
      invertX,
      invertY,
      keyIndexBaseL,
      false,
      1,
    );
  }
  if (isEvenSplit) {
    placeKeyEntitiesSet(
      design,
      nxMatrixKeys,
      nyMatrixKeys,
      numDirectKeys,
      numEncoderKeys,
      wrapX,
      !invertX,
      invertY,
      keyIndexBaseL,
      true,
      -1,
    );

    placeKeyEntitiesSet(
      design,
      nxMatrixKeys,
      nyMatrixKeys,
      numDirectKeys,
      numEncoderKeys,
      wrapX,
      invertX,
      invertY,
      keyIndexBaseR,
      true,
      1,
    );
  }
  if (isOddSplit) {
    placeKeyEntitiesSet(
      design,
      nxMatrixKeys,
      nyMatrixKeys,
      numDirectKeys,
      numEncoderKeys,
      wrapX,
      !invertX,
      invertY,
      keyIndexBaseL,
      true,
      -1,
    );

    placeKeyEntitiesSet(
      design,
      nxMatrixKeysR,
      nyMatrixKeysR,
      numDirectKeysR,
      numEncoderKeysR,
      wrapX,
      invertXR,
      invertY,
      keyIndexBaseR,
      true,
      1,
    );
  }

  fixCoordOrigin(design, isCentered);

  return design;
}
