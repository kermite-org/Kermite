import { mapObjectValues } from '~/base/utils';
import { IKeyboardDesign, IKeySizeUnit } from '~/editor/models/DataSchema';

export type ICoordUnit =
  | {
      mode: 'mm';
    }
  | {
      mode: 'KP';
      x: number;
      y: number;
    };

export function getCoordUnitFromUnitSpec(unitSpec: string): ICoordUnit {
  if (unitSpec === 'mm') {
    return { mode: 'mm' };
  }
  const [p0, p1, p2] = unitSpec.split(' ');
  if (p0 === 'KP') {
    const x = parseFloat(p1);
    const y = p2 !== undefined ? parseFloat(p2) : x;
    return { mode: 'KP', x, y };
  }
  throw new Error('invalid unit spec');
}

export function unitValueToMm(x: number, y: number, coordUnit: ICoordUnit) {
  if (coordUnit.mode === 'mm') {
    return [x, y];
  } else {
    return [x * coordUnit.x, y * coordUnit.y];
  }
}

export function mmToUnitValue(mmX: number, mmY: number, coordUnit: ICoordUnit) {
  if (coordUnit.mode === 'mm') {
    return [mmX, mmY];
  } else {
    return [mmX / coordUnit.x, mmY / coordUnit.y];
  }
}

export function changePlacementCoordUnit(
  design: IKeyboardDesign,
  newUnitSpec: string
) {
  if (design.placementUnit === newUnitSpec) {
    return design;
  }
  const srcCoordUnit = getCoordUnitFromUnitSpec(design.placementUnit);
  const dstCoordUnit = getCoordUnitFromUnitSpec(newUnitSpec);

  design.keyEntities = mapObjectValues(design.keyEntities, (ke) => {
    const [tmpX, tmpY] = unitValueToMm(ke.x, ke.y, srcCoordUnit);
    const [dstX, dstY] = mmToUnitValue(tmpX, tmpY, dstCoordUnit);
    return {
      ...ke,
      x: dstX,
      y: dstY,
    };
  });
  design.placementUnit = newUnitSpec;
}

export function keySizeValueToMm(
  w: number,
  h: number,
  keySizeUnit: IKeySizeUnit,
  coordUnit: ICoordUnit
) {
  if (keySizeUnit === 'mm') {
    return [w, h];
  } else if (keySizeUnit === 'U') {
    return [w * 19 - 1, h * 19 - 1];
  } else if (keySizeUnit === 'KP') {
    if (coordUnit.mode === 'KP') {
      return [w * coordUnit.x - 1, h * coordUnit.y - 1];
    } else {
      return [w * 19 - 1, h * 19 - 1];
    }
  }
  throw new Error();
}

export function mmToKeySizeValue(
  mmW: number,
  mmH: number,
  keySizeUnit: IKeySizeUnit,
  coordUnit: ICoordUnit
) {
  if (keySizeUnit === 'mm') {
    return [mmW, mmH];
  } else if (keySizeUnit === 'U') {
    return [(mmW + 1) / 19, (mmH + 1) / 19];
  } else if (keySizeUnit === 'KP') {
    if (coordUnit.mode === 'KP') {
      return [(mmW + 1) / coordUnit.x, (mmH + 1) / coordUnit.y];
    } else {
      return [(mmW + 1) / 19, (mmH + 1) / 19];
    }
  }
  throw new Error();
}

export function changeKeySizeUnit(
  design: IKeyboardDesign,
  newUnit: IKeySizeUnit,
  coordUnit: ICoordUnit
) {
  if (design.keySizeUnit === newUnit) {
    return design;
  }
  const oldUnit = design.keySizeUnit;
  Object.values(design.keyEntities).forEach((ke) => {
    if (ke.shape.startsWith('std')) {
      const [, p1, p2] = ke.shape.split(' ');
      if (p1 === undefined) {
        throw new Error(`invalid shape spec ${ke.shape} for key ${ke.keyId}`);
      }
      const pw = parseFloat(p1);
      let ph = (p2 && parseFloat(p2)) || undefined;
      if (!ph) {
        if (oldUnit === 'mm') {
          ph = pw;
        } else if (oldUnit === 'KP' || 'U') {
          ph = 1;
        }
      }
      const [tmpW, tmpH] = keySizeValueToMm(pw, ph!, oldUnit, coordUnit);
      const [dstW, dstH] = mmToKeySizeValue(tmpW, tmpH, newUnit, coordUnit);
      console.log({ pw, tmpW, dstW });
      const omitH =
        (newUnit === 'mm' && dstH === dstW) ||
        ((newUnit === 'U' || newUnit === 'KP') && dstH === 1);
      ke.shape = omitH ? `std ${dstW}` : `std ${dstW} ${dstH}`;
    }
  });
  design.keySizeUnit = newUnit;
}

export function getStdKeySize(
  shapeSpec: string,
  coordUnit: ICoordUnit,
  sizeUnit: IKeySizeUnit
) {
  if (shapeSpec.startsWith('std')) {
    const [, p1, p2] = shapeSpec.split(' ');
    const pw = (p1 && parseFloat(p1)) || undefined;
    const ph = (p2 && parseFloat(p2)) || undefined;

    if (sizeUnit === 'mm') {
      const w = pw || 10;
      const h = ph || pw || 10;
      return [w, h];
    } else if (sizeUnit === 'U') {
      const baseSize = 19;
      const uw = pw || 1;
      const uh = ph || 1;
      return [uw * baseSize - 1, uh * baseSize - 1];
    } else if (sizeUnit === 'KP') {
      const baseW = (coordUnit.mode === 'KP' && coordUnit.x) || 19;
      const baseH = (coordUnit.mode === 'KP' && coordUnit.y) || 19;
      const uw = pw || 1;
      const uh = ph || 1;
      return [uw * baseW - 1, uh * baseH - 1];
    }
  }
  return [18, 18];
}
