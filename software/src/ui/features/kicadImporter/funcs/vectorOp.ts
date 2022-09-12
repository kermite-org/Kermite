import { IPoint, IVector } from '../base';

export const vectorOp = {
  getDist(p0: IPoint, p1: IPoint): number {
    const dx = p1.x - p0.x;
    const dy = p1.y - p0.y;
    return Math.sqrt(dx * dx + dy * dy);
  },
  middle(p0: IPoint, p1: IPoint): IPoint {
    return {
      x: (p0.x + p1.x) / 2,
      y: (p0.y + p1.y) / 2,
    };
  },
  subtract(pb: IPoint, pa: IPoint): IVector {
    return {
      x: pb.x - pa.x,
      y: pb.y - pa.y,
    };
  },
  add(pa: IPoint, pb: IVector): IPoint {
    return {
      x: pa.x + pb.x,
      y: pa.y + pb.y,
    };
  },
  rotate(v: IVector, theta: number): IVector {
    return {
      x: v.x * Math.cos(theta) - v.y * Math.sin(theta),
      y: v.x * Math.sin(theta) + v.y * Math.cos(theta),
    };
  },
  normalize(v: IVector): IVector {
    const norm = Math.sqrt(v.x * v.x + v.y * v.y);
    return {
      x: v.x / norm,
      y: v.y / norm,
    };
  },
  scale(v: IVector, sc: number): IVector {
    return {
      x: v.x * sc,
      y: v.y * sc,
    };
  },
};
