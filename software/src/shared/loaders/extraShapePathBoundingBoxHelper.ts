import svgPathBbox from 'svg-path-bbox';
import { IExtraShapeDefinition } from '../defs';
import { scaleCoord, translateCoord } from '../funcs';

export function calculateExtraShapeBoundingBoxPoints(
  extraShape: IExtraShapeDefinition,
): { x: number; y: number }[] {
  if (extraShape.path) {
    const [bx0, by0, bx1, by1] = svgPathBbox(extraShape.path);
    if ([bx0, by0, bx1, by1].some((it) => !isFinite(it))) {
      return [];
    }
    const multY = extraShape.invertY ? -1 : 1;
    const p0 = { x: bx0, y: by0 * multY };
    const p1 = { x: bx1, y: by1 * multY };
    scaleCoord(p0, extraShape.scale);
    translateCoord(p0, extraShape.x, extraShape.y);
    scaleCoord(p1, extraShape.scale);
    translateCoord(p1, extraShape.x, extraShape.y);
    return [p0, p1];
  } else {
    return [];
  }
}
