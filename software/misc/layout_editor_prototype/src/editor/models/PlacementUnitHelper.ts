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

export function getStdKeySize(shapeSpec: string, coordUnit: ICoordUnit) {
  const baseW = coordUnit.mode === 'KP' ? coordUnit.x : 19;
  const baseH = coordUnit.mode === 'KP' ? coordUnit.y : 19;
  if (shapeSpec.startsWith('std')) {
    const [, p1, p2] = shapeSpec.split(' ');
    const uw = (p1 && parseFloat(p1)) || 1;
    const uh = (p2 && parseFloat(p2)) || 1;
    return [uw * baseW - 1, uh * baseH - 1];
  }
  return [baseW - 1, baseH - 1];
}
