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

export type ILayoutTemplateAttributes = {
  numMatrixColumns: number;
  numMatrixRows: number;
  numIndividualKeys: number;
};

export const fallbackLayoutTemplateAttributes: ILayoutTemplateAttributes = {
  numMatrixColumns: 0,
  numMatrixRows: 0,
  numIndividualKeys: 0,
};
