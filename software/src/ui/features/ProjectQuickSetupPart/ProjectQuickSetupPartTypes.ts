export type ILayoutGeneratorOptions = {
  placementOrigin: 'topLeft' | 'center';
  invertX: boolean;
  invertY: boolean;
  invertXR: boolean;
  wrapX: number;
};

export const fallbackLayoutGeneratorOptions: ILayoutGeneratorOptions = {
  placementOrigin: 'topLeft',
  invertX: false,
  invertY: false,
  invertXR: false,
  wrapX: -1,
};
