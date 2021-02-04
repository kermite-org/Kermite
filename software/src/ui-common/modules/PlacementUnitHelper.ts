import { IKeySizeUnit } from '~/shared';

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

export function getStdKeySize(
  shapeSpec: string,
  coordUnit: ICoordUnit,
  sizeUnit: IKeySizeUnit,
) {
  if (shapeSpec.startsWith('std')) {
    const [, p1, p2] = shapeSpec.split(' ');
    const pw = (p1 && parseFloat(p1)) || undefined;
    const ph = (p2 && parseFloat(p2)) || undefined;

    if (sizeUnit === 'mm') {
      const w = pw || 10;
      const h = ph || pw || 10;
      return [w, h];
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

export function getKeySize(
  shapeSpec: string,
  coordUnit: ICoordUnit,
  keySizeUnit: IKeySizeUnit,
) {
  if (shapeSpec === 'ext circle') {
    return [18, 18];
  } else if (shapeSpec === 'ext isoEnter') {
    return [27, 37];
  }
  return getStdKeySize(shapeSpec, coordUnit, keySizeUnit);
}
