import { IPoint, IRect } from './geometryTypes';

export type IFootprintNode = {
  footprintName: string;
  referenceName: string;
  at: {
    x: number;
    y: number;
    angle?: number;
  };
};

export type IGrLineNode = {
  type: 'grLine';
  points: IPoint[];
};

export type IGrRectNode = {
  type: 'grRect';
  points: IPoint[];
};

export type IGrCircleNode = {
  type: 'grCircle';
  center: IPoint;
  radius: number;
};

export type IGrArcNode = {
  type: 'grArc';
  points: IPoint[];
  radius: number;
  arcFlipped?: boolean;
};

export type IGrPolygonNode = {
  type: 'grPoly';
  points: IPoint[];
};

export type IGrCurveNode = {
  type: 'grCurve';
  points: IPoint[];
};

export type IGrPathSegmentNode = IGrLineNode | IGrArcNode | IGrCurveNode;
export type IGrPathNode = {
  type: 'path';
  segments: IGrPathSegmentNode[];
};

export type IGraphicsNode =
  | IGrRectNode
  | IGrCircleNode
  | IGrPolygonNode
  | IGrPathNode;

export type IPcbShapeData = {
  footprints: IFootprintNode[];
  outlines: IGraphicsNode[];
  boundingBox: IRect;
};
