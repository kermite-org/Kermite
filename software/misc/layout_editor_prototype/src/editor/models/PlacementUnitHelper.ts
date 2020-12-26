import { mapObjectValues } from '~/base/utils';
import { IKeyboardDesign } from '~/editor/models/DataSchema';

export type ICoordUnit =
  | {
      mode: 'mm';
    }
  | {
      mode: 'KP';
      x: number;
      y: number;
    };

export function getCoordUnit(unitSpec: string): ICoordUnit {
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

function unitValueToMm(x: number, y: number, cu: ICoordUnit) {
  if (cu.mode === 'mm') {
    return [x, y];
  } else {
    return [x * cu.x, y * cu.y];
  }
}

function mmToUnitValue(mmX: number, mmY: number, cu: ICoordUnit) {
  if (cu.mode === 'mm') {
    return [mmX, mmY];
  } else {
    return [mmX / cu.x, mmY / cu.y];
  }
}

export function changePlacementCoordUnit(
  design: IKeyboardDesign,
  newUnitSpec: string
) {
  if (design.placementUnit === newUnitSpec) {
    return design;
  }
  const srcCoordUnit = getCoordUnit(design.placementUnit);
  const dstCoordUnit = getCoordUnit(newUnitSpec);

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
