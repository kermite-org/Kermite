import svgPathBbox from 'svg-path-bbox';

export function calculateExtraShapeBoundingBoxPoints(
  extraShapePath: string,
): { x: number; y: number }[] {
  if (extraShapePath) {
    const [bx0, by0, bx1, by1] = svgPathBbox(extraShapePath);
    if ([bx0, by0, bx1, by1].some((it) => !isFinite(it))) {
      return [];
    }
    const p0 = { x: bx0, y: by0 };
    const p1 = { x: bx1, y: by1 };
    return [p0, p1];
  } else {
    return [];
  }
}
