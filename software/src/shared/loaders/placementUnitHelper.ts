import { IsoEnterOutlineSizeSpec } from '~/shared/loaders/ExtendedKeyShapes';

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
    const x = (p1 && parseFloat(p1)) || 19;
    const y = (p2 && parseFloat(p2)) || x;
    return { mode: 'KP', x, y };
  }
  throw new Error('invalid unit spec');
}

export function getStdKeySize(shapeSpec: string, sizeUnit: ICoordUnit) {
  if (shapeSpec.startsWith('std')) {
    const [, p1, p2] = shapeSpec.split(' ');
    const pw = (p1 && parseFloat(p1)) || undefined;
    const ph = (p2 && parseFloat(p2)) || undefined;

    if (sizeUnit.mode === 'mm') {
      const w = pw || 10;
      const h = ph || pw || 10;
      return [w, h];
    } else if (sizeUnit.mode === 'KP') {
      const baseW = sizeUnit.x || 19;
      const baseH = sizeUnit.y || sizeUnit.x || 19;
      const uw = pw || 1;
      const uh = ph || 1;
      return [uw * baseW - 1, uh * baseH - 1];
    }
  }
  return [18, 18];
}

export function getKeySize(shapeSpec: string, sizeUnit: ICoordUnit) {
  // if (shapeSpec === 'ext circle') {
  //   return [18, 18];
  // } else
  if (shapeSpec === 'ext isoEnter') {
    return IsoEnterOutlineSizeSpec;
  }
  return getStdKeySize(shapeSpec, sizeUnit);
}
