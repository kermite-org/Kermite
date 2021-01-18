export type IKeySizeUnit = 'mm' | 'KP';

export type IKeyPlacementAnchor = 'topLeft' | 'center';

export interface IPersistKeyboardDesign {
  setup: {
    placementUnit: string;
    placementAnchor: IKeyPlacementAnchor;
    keySizeUnit: IKeySizeUnit;
  };
  keyEntities: {
    // label: string;
    x: number;
    y: number;
    angle: number;
    shape: string;
    keyIndex?: number;
    mirrorKeyIndex?: number;
    groupIndex?: number;
  }[];
  outlineShapes: {
    points: { x: number; y: number }[];
    groupIndex?: number;
  }[];
  transGroups: {
    // groupId: string;
    x: number;
    y: number;
    angle: number;
    mirror?: boolean;
  }[];
}

// ----------------------------------------

export type IDisplayKeyShape =
  | {
      type: 'rect';
      width: number;
      height: number;
    }
  | {
      type: 'circle';
      radius: number;
    }
  | {
      type: 'polygon';
      points: { x: number; y: number }[];
    };

export interface IDisplayKeyEntity {
  keyId: string;
  x: number;
  y: number;
  angle: number;
  keyIndex: number;
  shapeSpec: string;
  shape: IDisplayKeyShape;
}

export interface IDisplayBoundingBox {
  centerX: number;
  centerY: number;
  width: number;
  height: number;
}

export interface IDisplayOutlineShape {
  points: { x: number; y: number }[];
}

export interface IDisplayKeyboardDesign {
  keyEntities: IDisplayKeyEntity[];
  outlineShapes: IDisplayOutlineShape[];
  boundingBox: IDisplayBoundingBox;
}

export function createFallbackDisplayKeyboardDesign(): IDisplayKeyboardDesign {
  return {
    keyEntities: [],
    outlineShapes: [],
    boundingBox: {
      centerX: 0,
      centerY: 0,
      width: 100,
      height: 100,
    },
  };
}
