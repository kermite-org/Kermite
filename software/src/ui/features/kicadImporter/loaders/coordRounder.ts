import { IFootprintNode, IGraphicsNode, IPoint } from '../base';

function roundCoord(value: number): number {
  return Math.round(value * 10000) / 10000;
}

function roundCoordXY(p: IPoint) {
  return {
    x: roundCoord(p.x),
    y: roundCoord(p.y),
  };
}

export function coordRounder_roundGraphicsCoord(
  graphicsNodes: IGraphicsNode[],
) {
  graphicsNodes.forEach((gr) => {
    if (gr.type === 'path') {
      gr.segments.forEach((seg) => {
        seg.points = seg.points.map(roundCoordXY);
        if (seg.type === 'grArc') {
          seg.radius = roundCoord(seg.radius);
        }
      });
    } else if (gr.type === 'grCircle') {
      gr.center = roundCoordXY(gr.center);
      gr.radius = roundCoord(gr.radius);
    } else if (gr.type === 'grPoly') {
      gr.points = gr.points.map(roundCoordXY);
    } else if (gr.type === 'grRect') {
      gr.points = gr.points.map(roundCoordXY);
    }
  });
  return graphicsNodes;
}

export function coordRounder_roundFootprintsCoord(
  footprints: IFootprintNode[],
) {
  footprints.forEach((fp) => {
    fp.at.x = roundCoord(fp.at.x);
    fp.at.y = roundCoord(fp.at.y);
    fp.at.angle =
      fp.at.angle !== undefined ? roundCoord(fp.at.angle) : undefined;
  });
}
