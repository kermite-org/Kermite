import { mapObjectValues, IKeySizeUnit } from '~/shared';
import {
  ICoordUnit,
  getCoordUnitFromUnitSpec,
} from '~/shared/modules/PlacementUnitHelper';
import { IEditKeyboardDesign } from '~/ui/layouter/editor/store';

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

export function keySizeValueToMm(
  w: number,
  h: number,
  keySizeUnit: IKeySizeUnit,
  coordUnit: ICoordUnit,
) {
  if (keySizeUnit === 'mm') {
    return [w, h];
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
  coordUnit: ICoordUnit,
) {
  if (keySizeUnit === 'mm') {
    return [mmW, mmH];
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
  design: IEditKeyboardDesign,
  newUnit: IKeySizeUnit,
  coordUnit: ICoordUnit,
) {
  if (design.setup.keySizeUnit === newUnit) {
    return design;
  }
  const oldUnit = design.setup.keySizeUnit;
  Object.values(design.keyEntities).forEach((ke) => {
    if (ke.shape.startsWith('std')) {
      const [, p1, p2] = ke.shape.split(' ');
      if (p1 === undefined) {
        throw new Error(`invalid shape spec ${ke.shape} for key ${ke.id}`);
      }
      const pw = parseFloat(p1);
      let ph = (p2 && parseFloat(p2)) || undefined;
      if (!ph) {
        if (oldUnit === 'mm') {
          ph = pw;
        } else if (oldUnit === 'KP') {
          ph = 1;
        }
      }
      const [tmpW, tmpH] = keySizeValueToMm(pw, ph!, oldUnit, coordUnit);
      const [dstW, dstH] = mmToKeySizeValue(tmpW, tmpH, newUnit, coordUnit);
      const omitH =
        (newUnit === 'mm' && dstH === dstW) || (newUnit === 'KP' && dstH === 1);
      ke.shape = omitH ? `std ${dstW}` : `std ${dstW} ${dstH}`;
    }
  });
  design.setup.keySizeUnit = newUnit;
}
