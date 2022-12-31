import svgpath from 'svgpath';
import {
  IKeyPlacementAnchor,
  degToRad,
  radToDeg,
  rotateCoord,
  translateCoord,
} from '~/app-shared';
import {
  ICoordUnit,
  calculateExtraShapeBoundingBoxPoints,
  getCoordUnitFromUnitSpec,
  getKeySize,
} from '~/app-shared-2';
import {
  IEditExtraShape,
  IEditKeyEntity,
  IEditKeyboardDesign,
  IEditOutlineShape,
  IEditTransGroup,
} from './dataSchema';

function getKeyCornerPoints(
  ke: IEditKeyEntity,
  sizeUnit: ICoordUnit,
  placementAnchor: IKeyPlacementAnchor,
) {
  const [w, h] = getKeySize(ke.shape, sizeUnit);
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

function getGroupTransAmount(group: IEditTransGroup | undefined) {
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
  sizeUnit: ICoordUnit,
  design: IEditKeyboardDesign,
  isMirror: boolean,
) {
  const mi = isMirror ? -1 : 1;

  const keyX = coordUnit.mode === 'KP' ? ke.x * coordUnit.x : ke.x;
  const keyY = coordUnit.mode === 'KP' ? ke.y * coordUnit.y : ke.y;
  const keyRot = degToRad(ke.angle);

  const group = design.transGroups[ke.groupId];
  const { groupX, groupY, groupRot } = getGroupTransAmount(group);

  const points = getKeyCornerPoints(ke, sizeUnit, design.setup.placementAnchor);

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

function addExtraShapePoints(
  xs: number[],
  ys: number[],
  shape: IEditExtraShape,
  design: IEditKeyboardDesign,
  isMirror: boolean,
) {
  const mi = isMirror ? -1 : 1;
  const group = design.transGroups[shape.groupId];
  const { groupX, groupY, groupRot } = getGroupTransAmount(group);

  const path = svgpath(shape.path)
    .scale(mi, shape.invertY ? -1 : 1)
    .translate(shape.x, shape.y)
    .rotate(radToDeg(groupRot) * mi)
    .translate(groupX * mi, groupY)
    .toString();

  const points = calculateExtraShapeBoundingBoxPoints(path);

  points.forEach((p) => {
    xs.push(p.x);
    ys.push(p.y);
  });
}

export function getKeyboardDesignBoundingBox(design: IEditKeyboardDesign) {
  const coordUnit = getCoordUnitFromUnitSpec(design.setup.placementUnit);
  const sizeUnit = getCoordUnitFromUnitSpec(design.setup.keySizeUnit);
  const xs: number[] = [];
  const ys: number[] = [];

  Object.values(design.keyEntities).forEach((ke) => {
    const group = design.transGroups[ke.groupId];
    if (group?.mirror) {
      addKeyPoints(xs, ys, ke, coordUnit, sizeUnit, design, true);
    }
    addKeyPoints(xs, ys, ke, coordUnit, sizeUnit, design, false);
  });

  Object.values(design.outlineShapes).forEach((shape) => {
    const group = design.transGroups[shape.groupId];
    if (group?.mirror) {
      addShapePoints(xs, ys, shape, design, true);
    }
    addShapePoints(xs, ys, shape, design, false);
  });

  {
    const { extraShape } = design;
    const group = design.transGroups[extraShape.groupId];
    if (group?.mirror) {
      addExtraShapePoints(xs, ys, design.extraShape, design, true);
    }
    addExtraShapePoints(xs, ys, design.extraShape, design, false);
  }

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
