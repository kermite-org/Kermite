export type IKeyPlacementAnchor = 'topLeft' | 'center';

export type IKeyIdMode = 'auto' | 'manual';

export interface IPersistKeyboardDesignRealKeyEntity {
  keyId: string;
  x: number;
  y: number;
  angle?: number;
  shape?: string;
  keyIndex?: number;
  groupIndex?: number;
}

export interface IPersistKeyboardDesignMirrorKeyEntity {
  keyId: string;
  mirrorOf: string;
  keyIndex?: number;
}

export interface IPersistExtraShape {
  path: string;
  x: number;
  y: number;
  scale: number;
  invertY: boolean;
  groupIndex?: number;
}
export interface IPersistKeyboardDesign {
  formatRevision: 'LA01';
  setup: {
    placementUnit: string; // 'mm' | 'KP x <y>'
    placementAnchor: IKeyPlacementAnchor;
    keySizeUnit: string; // 'mm' | 'KP x <y>'
    keyIdMode: IKeyIdMode;
  };
  keyEntities: (
    | IPersistKeyboardDesignRealKeyEntity
    | IPersistKeyboardDesignMirrorKeyEntity
  )[];
  outlineShapes: {
    points: { x: number; y: number }[];
    groupIndex?: number;
  }[];
  extraShape?: IPersistExtraShape;
  transformationGroups: {
    // groupId: string;
    x: number;
    y: number;
    angle?: number;
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
  // | {
  //     type: 'circle';
  //     radius: number;
  //   }
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

export interface IDisplayArea {
  centerX: number;
  centerY: number;
  width: number;
  height: number;
}

export interface IDisplayOutlineShape {
  points: { x: number; y: number }[];
}

export interface IDisplayExtraShape {
  path: string;
  scaleForLineWeight: number;
}

export interface IDisplayKeyboardDesign {
  keyEntities: IDisplayKeyEntity[];
  outlineShapes: IDisplayOutlineShape[];
  displayArea: IDisplayArea;
  extraShapes: IDisplayExtraShape[];
}
