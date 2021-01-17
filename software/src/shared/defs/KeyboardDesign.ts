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
