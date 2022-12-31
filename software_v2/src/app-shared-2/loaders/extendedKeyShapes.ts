import { IKeyPlacementAnchor } from '~/app-shared';

type IPoint = { x: number; y: number };

const isoEnterPointsInUnitU: IPoint[] = [
  [-0.875, -1],
  [-0.875, 0],
  [-0.625, 0],
  [-0.625, 1],
  [0.625, 1],
  [0.625, -1],
].map(([x, y]) => ({ x, y }));

const standardKeyBasePitch = 19.05;
const displayShrinkOffset = 0.5;

export const IsoEnterOutlineSizeSpec = [27, 37];

function createIsoEnterPolygonPoints(
  placementAnchor: IKeyPlacementAnchor,
): IPoint[] {
  const points = isoEnterPointsInUnitU.map((p, idx) => {
    const ex =
      p.x * standardKeyBasePitch - Math.sign(p.x) * displayShrinkOffset;
    let ey = p.y * standardKeyBasePitch - Math.sign(p.y) * displayShrinkOffset;
    if (idx === 1 || idx === 2) {
      ey -= displayShrinkOffset;
    }
    return { x: ex, y: ey };
  });

  if (placementAnchor === 'topLeft') {
    const originXInMm = isoEnterPointsInUnitU[0].x * standardKeyBasePitch;
    const originYInMm = isoEnterPointsInUnitU[0].y * standardKeyBasePitch;
    return points.map((p) => ({ x: p.x - originXInMm, y: p.y - originYInMm }));
  }
  return points;
}

function convertPointsToSvgPathSpecText(points: IPoint[]): string {
  return points
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x}, ${p.y}`)
    .join(', ')
    .concat('z');
}

function convertPointsToSvgPolygonPointsSpec(points: IPoint[]): string {
  return points.map(({ x, y }) => `${x}, ${y}`).join(' ');
}

// IsoEnterの配置
// topLeft: 19.05mmベースのグリッドで、isoEnterの左上の角を基点として配置
// center: IsoEnterのキースイッチの軸の位置を基点として配置
const pointsTopLeft = createIsoEnterPolygonPoints('topLeft');
const pointsCentered = createIsoEnterPolygonPoints('center');

export function getIsoEnterShapePoints(
  placementAnchor: IKeyPlacementAnchor,
): IPoint[] {
  return placementAnchor === 'topLeft' ? pointsTopLeft : pointsCentered;
}

export function getIsoEnterSvgPolygonPointsSpec(
  placementAnchor: IKeyPlacementAnchor,
): string {
  return placementAnchor === 'topLeft'
    ? convertPointsToSvgPolygonPointsSpec(pointsTopLeft)
    : convertPointsToSvgPolygonPointsSpec(pointsCentered);
}

export function getIsoEnterSvgPathSpecText(
  placementAnchor: IKeyPlacementAnchor,
): string {
  return placementAnchor === 'topLeft'
    ? convertPointsToSvgPathSpecText(pointsTopLeft)
    : convertPointsToSvgPathSpecText(pointsCentered);
}
