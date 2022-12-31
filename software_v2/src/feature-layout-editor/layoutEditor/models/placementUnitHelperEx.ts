import { mapObjectValues } from '~/app-shared';
import { ICoordUnit, getCoordUnitFromUnitSpec } from '~/app-shared-2';
import { IEditKeyboardDesign } from './dataSchema';

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
  design: IEditKeyboardDesign,
  newUnitSpec: string,
) {
  if (design.setup.placementUnit === newUnitSpec) {
    return design;
  }
  const srcCoordUnit = getCoordUnitFromUnitSpec(design.setup.placementUnit);
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
  design.setup.placementUnit = newUnitSpec;
}

export function keySizeValueToMm(w: number, h: number, sizeUnit: ICoordUnit) {
  if (sizeUnit.mode === 'mm') {
    return [w, h];
  } else if (sizeUnit.mode === 'KP') {
    return [w * sizeUnit.x - 1, h * sizeUnit.y - 1];
  }
  throw new Error();
}

export function mmToKeySizeValue(
  mmW: number,
  mmH: number,
  sizeUnit: ICoordUnit,
) {
  if (sizeUnit.mode === 'mm') {
    return [mmW, mmH];
  } else if (sizeUnit.mode === 'KP') {
    return [(mmW + 1) / sizeUnit.x, (mmH + 1) / sizeUnit.y];
  }
  throw new Error();
}

export function changeKeySizeUnit(
  design: IEditKeyboardDesign,
  newKeySizeUnit: string,
) {
  if (design.setup.keySizeUnit === newKeySizeUnit) {
    return;
  }
  if (
    design.setup.keySizeUnit.startsWith('KP') &&
    newKeySizeUnit.startsWith('KP')
  ) {
    design.setup.keySizeUnit = newKeySizeUnit;
    return;
  }
  const oldKeySizeUnit = design.setup.keySizeUnit;
  const oldUnit = getCoordUnitFromUnitSpec(oldKeySizeUnit);
  const newUnit = getCoordUnitFromUnitSpec(newKeySizeUnit);
  Object.values(design.keyEntities).forEach((ke) => {
    if (ke.shape.startsWith('std')) {
      const [, p1, p2] = ke.shape.split(' ');
      if (p1 === undefined) {
        throw new Error(`invalid shape spec ${ke.shape} for key ${ke.id}`);
      }
      const pw = parseFloat(p1);
      let ph = (p2 && parseFloat(p2)) || undefined;
      if (!ph) {
        if (oldUnit.mode === 'mm') {
          ph = pw;
        } else if (oldUnit.mode === 'KP') {
          ph = 1;
        }
      }
      const [tmpW, tmpH] = keySizeValueToMm(pw, ph!, oldUnit);
      const [dstW, dstH] = mmToKeySizeValue(tmpW, tmpH, newUnit);
      const omitH =
        (newUnit.mode === 'mm' && dstH === dstW) ||
        (newUnit.mode === 'KP' && dstH === 1);
      ke.shape = omitH ? `std ${dstW}` : `std ${dstW} ${dstH}`;
    }
  });
  design.setup.keySizeUnit = newKeySizeUnit;
}
