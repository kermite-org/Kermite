import { degToRad } from '~/base/utils';
import { IKeyboardDesign, IKeySizeUnit } from '~/editor/store/DataSchema';
import {
  getCoordUnitFromUnitSpec,
  getStdKeySize,
  ICoordUnit,
} from '~/editor/store/PlacementUnitHelper';

function getKeySize(
  shapeSpec: string,
  coordUnit: ICoordUnit,
  keySizeUnit: IKeySizeUnit
) {
  if (shapeSpec === 'ext circle') {
    return [18, 18];
  } else if (shapeSpec === 'ext isoEnter') {
    return [27, 37];
  }
  return getStdKeySize(shapeSpec, coordUnit, keySizeUnit);
}

export function getKeyboardDesignBoundingBox(design: IKeyboardDesign) {
  const coordUnit = getCoordUnitFromUnitSpec(design.placementUnit);
  const xs: number[] = [];
  const ys: number[] = [];
  Object.values(design.keyEntities).forEach((ke) => {
    let { x, y, r } = ke;
    if (coordUnit.mode === 'KP') {
      x *= coordUnit.x;
      y *= coordUnit.y;
    }
    const [w, h] = getKeySize(ke.shape, coordUnit, design.keySizeUnit);
    const dx = w / 2;
    const dy = h / 2;
    const theta = degToRad(r);

    const points = [
      [-dx, -dy],
      [-dx, dy],
      [dx, -dy],
      [dx, dy],
    ];
    points.forEach(([px, py]) => {
      const ax = px * Math.cos(theta) - py * Math.sin(theta);
      const ay = px * Math.sin(theta) + py * Math.cos(theta);
      xs.push(x + ax);
      ys.push(y + ay);
    });
  });

  design.outlinePoints.forEach(([x, y]) => {
    xs.push(x);
    ys.push(y);
  });

  const left = Math.min(...xs);
  const right = Math.max(...xs);
  const top = Math.min(...ys);
  const bottom = Math.max(...ys);

  return { top, left, bottom, right };
}
