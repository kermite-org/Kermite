import { IPosition } from '~/ui-layouter/base';
import { degToRad } from '~/ui-layouter/base/utils';
import {
  IEditKeyboardDesign,
  IEditKeyEntity,
  IEditOutlineShape,
  IKeyPlacementAnchor,
  IKeySizeUnit,
  ITransGroup,
} from './DataSchema';
import {
  getCoordUnitFromUnitSpec,
  getStdKeySize,
  ICoordUnit,
} from './PlacementUnitHelper';

function getKeySize(
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

function rotateCoord(p: IPosition, theta: number) {
  const tmpX = p.x * Math.cos(theta) - p.y * Math.sin(theta);
  const tmpY = p.x * Math.sin(theta) + p.y * Math.cos(theta);
  p.x = tmpX;
  p.y = tmpY;
}

function translateCoord(p: IPosition, ax: number, ay: number) {
  p.x += ax;
  p.y += ay;
}

function getKeyCornerPoints(
  ke: IEditKeyEntity,
  coordUnit: ICoordUnit,
  keySizeUnit: IKeySizeUnit,
  placementAnchor: IKeyPlacementAnchor,
) {
  const [w, h] = getKeySize(ke.shape, coordUnit, keySizeUnit);
  const dx = w / 2;
  const dy = h / 2;

  const points = [
    [-dx, -dy],
    [-dx, dy],
    [dx, -dy],
    [dx, dy],
  ];
  if (placementAnchor === 'topLeft') {
    points.forEach((p) => {
      p[0] += w / 2 + 0.5;
      p[1] += h / 2 + 0.5;
    });
  }
  return points;
}

function getGroupTransAmount(group: ITransGroup | undefined) {
  const groupX = group ? group.x : 0;
  const groupY = group ? group.y : 0;
  const groupRot = degToRad(group?.angle || 0);
  return { groupX, groupY, groupRot };
}

function addKeyPoints(
  xs: number[],
  ys: number[],
  ke: IEditKeyEntity,
  coordUnit: ICoordUnit,
  design: IEditKeyboardDesign,
  isMirror: boolean,
) {
  const mi = isMirror ? -1 : 1;

  const keyX = coordUnit.mode === 'KP' ? ke.x * coordUnit.x : ke.x;
  const keyY = coordUnit.mode === 'KP' ? ke.y * coordUnit.y : ke.y;
  const keyRot = degToRad(ke.angle);

  const group = design.transGroups[ke.groupId];
  const { groupX, groupY, groupRot } = getGroupTransAmount(group);

  const points = getKeyCornerPoints(
    ke,
    coordUnit,
    design.keySizeUnit,
    design.placementAnchor,
  );

  points.forEach(([px, py]) => {
    const p = { x: px, y: py };
    rotateCoord(p, keyRot * mi);
    translateCoord(p, keyX * mi, keyY);
    rotateCoord(p, groupRot * mi);
    translateCoord(p, groupX * mi, groupY);
    xs.push(p.x);
    ys.push(p.y);
  });
}

function addShapePoints(
  xs: number[],
  ys: number[],
  shape: IEditOutlineShape,
  design: IEditKeyboardDesign,
  isMirror: boolean,
) {
  const mi = isMirror ? -1 : 1;

  const group = design.transGroups[shape.groupId];
  const { groupX, groupY, groupRot } = getGroupTransAmount(group);

  shape.points.forEach((p0) => {
    const p = { x: p0.x * mi, y: p0.y };
    rotateCoord(p, groupRot * mi);
    translateCoord(p, groupX * mi, groupY);
    xs.push(p.x);
    ys.push(p.y);
  });
}

export function getKeyboardDesignBoundingBox(design: IEditKeyboardDesign) {
  const coordUnit = getCoordUnitFromUnitSpec(design.placementUnit);
  const xs: number[] = [];
  const ys: number[] = [];

  Object.values(design.keyEntities).forEach((ke) => {
    const group = design.transGroups[ke.groupId];
    if (group?.mirror) {
      addKeyPoints(xs, ys, ke, coordUnit, design, true);
    }
    addKeyPoints(xs, ys, ke, coordUnit, design, false);
  });

  Object.values(design.outlineShapes).forEach((shape) => {
    const group = design.transGroups[shape.groupId];
    if (group?.mirror) {
      addShapePoints(xs, ys, shape, design, true);
    }
    addShapePoints(xs, ys, shape, design, false);
  });

  if (xs.length === 0 || ys.length === 0) {
    return {
      left: -80,
      right: 80,
      top: -60,
      bottom: 60,
    };
  }

  const left = Math.min(...xs);
  const right = Math.max(...xs);
  const top = Math.min(...ys);
  const bottom = Math.max(...ys);

  return { top, left, bottom, right };
}
