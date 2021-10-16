export type ILayoutGeneratorOptions = {
  placementOrigin: 'topLeft' | 'center';
  invertX: boolean;
  invertXR: boolean;
  invertY: boolean;
  wrapX: number;
};

export const fallbackLayoutGeneratorOptions: ILayoutGeneratorOptions = {
  placementOrigin: 'topLeft',
  invertX: false,
  invertXR: false,
  invertY: false,
  wrapX: -1,
};
