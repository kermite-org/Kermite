import { IPcbShapeData } from './pcbShapeDataTypes';

export const fallbackPcbShapeData: IPcbShapeData = {
  footprints: [],
  outlines: [],
  boundingBox: {
    x: 0,
    y: 0,
    w: 100,
    h: 100,
  },
};
