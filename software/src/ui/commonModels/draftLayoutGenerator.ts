import {
  createFallbackPersistKeyboardDesign,
  generateNumberSequence,
  IStandardFirmwareConfig,
  IPersistKeyboardDesign,
  IPersistKeyboardDesignRealKeyEntity,
  IStandardBaseFirmwareType,
  splitBytesN,
} from '~/shared';
import { ILayoutGeneratorOptions } from '~/ui/base';
import {
  IDraftLayoutLabelEntity,
  IDraftLayoutLabelEntityPinType,
} from '~/ui/fabrics/layoutPreviewShapeView/layoutPreviewShapeViewTypes';

function makeLabelEntity(
  keyId: string,
  pinType: IDraftLayoutLabelEntityPinType,
  pinName: string,
): IDraftLayoutLabelEntity {
  return { keyId, pinType, pinName };
}

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
  labelEntities: IDraftLayoutLabelEntity[],
  columnPins: string[],
  rowPins: string[],
  directPins: string[],
  encoderPins: string[],
  wrapX: number,
  invertIndicesX: boolean,
  invertIndicesY: boolean,
  keyIndexBase: number,
  isSplit: boolean,
  dir: number,
) {
  let mainKeyBlockHeight = 0;
  if (columnPins.length > 0 && rowPins.length > 0) {
    const nx = columnPins.length;
    const ny = rowPins.length;
    const keys = makeMatrixKeyEntities(
      nx * ny,
      nx,
      0,
      invertIndicesX,
      invertIndicesY,
      keyIndexBase,
      isSplit,
      dir,
      1,
    );
    design.keyEntities.push(...keys);
    columnPins.forEach((pin, i) => {
      let ix = i;
      if (invertIndicesX) {
        ix = nx - 1 - ix;
      }
      const le = makeLabelEntity(keys[ix].keyId, 'column', `col${i}`);
      labelEntities.push(le);
    });
    rowPins.forEach((pin, i) => {
      let iy = i;
      if (invertIndicesY) {
        iy = ny - 1 - iy;
      }
      if (!isSplit) {
        const ki = iy * nx;
        const le = makeLabelEntity(keys[ki].keyId, 'rowL', `row${i}`);
        labelEntities.push(le);
      } else {
        const ki = iy * nx + (nx - 1);
        const le = makeLabelEntity(
          keys[ki].keyId,
          dir === -1 ? 'rowL' : 'rowR',
          `row${i}`,
        );
        labelEntities.push(le);
      }
    });
    keyIndexBase += keys.length;
    mainKeyBlockHeight = ny;
  }
  if (directPins.length > 0) {
    const num = directPins.length;
    const nx = wrapX;
    const offsetY = mainKeyBlockHeight;
    const keys = makeMatrixKeyEntities(
      num,
      nx,
      offsetY,
      invertIndicesX,
      false,
      keyIndexBase,
      isSplit,
      dir,
      1,
    );
    design.keyEntities.push(...keys);
    keys.forEach((key) => {
      const i = key.keyIndex! - keyIndexBase;
      const le = makeLabelEntity(key.keyId, 'itself', `dw${i}`);
      labelEntities.push(le);
    });
    keyIndexBase += keys.length;
    if (!mainKeyBlockHeight) {
      mainKeyBlockHeight = Math.ceil(num / nx);
    }
  }
  if (encoderPins.length > 0) {
    const num = encoderPins.length;
    const nx = wrapX;
    let offsetY = 0;
    if (mainKeyBlockHeight) {
      offsetY = -1.5;
    }
    const keys = makeMatrixKeyEntities(
      num,
      nx,
      offsetY,
      invertIndicesX,
      false,
      keyIndexBase,
      isSplit,
      dir,
      -1,
    );
    design.keyEntities.push(...keys);
    keys.forEach((key) => {
      const i = key.keyIndex! - keyIndexBase;
      const encIndex = (i / 2) >> 0;
      const encPinMode = i % 2 === 0 ? 'a' : 'b';
      const pinFunctionName = `enc${encIndex}${encPinMode}`;
      const le = makeLabelEntity(key.keyId, 'itself', pinFunctionName);
      labelEntities.push(le);
    });
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
  spec: IStandardFirmwareConfig,
  layoutOptions: ILayoutGeneratorOptions,
): [IPersistKeyboardDesign, IDraftLayoutLabelEntity[]] {
  const design = createFallbackPersistKeyboardDesign();
  const labelEntities: IDraftLayoutLabelEntity[] = [];
  const { placementOrigin, invertX, invertXR, invertY } = layoutOptions;
  const isCentered = placementOrigin === 'center';
  if (isCentered) {
    design.setup.placementAnchor = 'center';
  }

  const isUnified = unifiedKeyboardTypes.includes(spec.baseFirmwareType);
  const isEvenSplit = evenSplitKeyboardTypes.includes(spec.baseFirmwareType);
  const isOddSplit = oddSplitKeyboardTypes.includes(spec.baseFirmwareType);

  const wrapX = 4;

  const columnPins = (spec.useMatrixKeyScanner && spec.matrixColumnPins) || [];
  const rowPins = (spec.useMatrixKeyScanner && spec.matrixRowPins) || [];
  const directPins =
    (spec.useDirectWiredKeyScanner && spec.directWiredPins) || [];
  const encoderPins = (spec.useEncoder && spec.encoderPins) || [];

  const columnPinsR =
    (spec.useMatrixKeyScanner && spec.matrixColumnPinsR) || [];
  const rowPinsR = (spec.useMatrixKeyScanner && spec.matrixRowPinsR) || [];
  const directPinsR =
    (spec.useDirectWiredKeyScanner && spec.directWiredPinsR) || [];
  const encoderPinsR = (spec.useEncoder && spec.encoderPinsR) || [];

  const keyIndexBaseL = 0;
  const keyIndexBaseR =
    columnPins.length * rowPins.length + directPins.length + encoderPins.length;

  if (isUnified) {
    placeKeyEntitiesSet(
      design,
      labelEntities,
      columnPins,
      rowPins,
      directPins,
      encoderPins,
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
      labelEntities,
      columnPins,
      rowPins,
      directPins,
      encoderPins,
      wrapX,
      invertX,
      invertY,
      keyIndexBaseL,
      true,
      -1,
    );

    placeKeyEntitiesSet(
      design,
      labelEntities,
      columnPins,
      rowPins,
      directPins,
      encoderPins,
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
      labelEntities,
      columnPins,
      rowPins,
      directPins,
      encoderPins,
      wrapX,
      invertX,
      invertY,
      keyIndexBaseL,
      true,
      -1,
    );

    placeKeyEntitiesSet(
      design,
      labelEntities,
      columnPinsR,
      rowPinsR,
      directPinsR,
      encoderPinsR,
      wrapX,
      invertXR,
      invertY,
      keyIndexBaseR,
      true,
      1,
    );
  }

  fixCoordOrigin(design, isCentered);

  return [design, labelEntities];
}
