import { IPoint } from '../base';
import { vectorOp } from '../funcs';

export function calculateCircleRadiusFrom3PointArc(points: IPoint[]): number {
  const [p0, p1, p2] = points;
  const mp = vectorOp.middle(p0, p2);
  const h = vectorOp.getDist(mp, p0);
  const d = vectorOp.getDist(mp, p1);
  const r = (d + h * h) / (2 * d);
  return r;
}
