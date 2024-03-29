import {
  IPersistExtraShape,
  IPersistKeyboardDesign,
  IPersistKeyboardDesignRealKeyEntity,
} from '~/shared';
import { IPcbShapeData } from '../base';
import { outlineShapePathBuilder_buildPathSpecString } from './outlineShapePathBuilder';

export function keyboardDesignBuilder_convertPcbShapeDataToPersistKeyboardDesign(
  pcbShapeData: IPcbShapeData,
  invertFacing: boolean,
): IPersistKeyboardDesign {
  const keyEntities: IPersistKeyboardDesignRealKeyEntity[] =
    pcbShapeData.footprints.map((fp) => ({
      keyId: fp.referenceName,
      x: fp.at.x,
      y: fp.at.y,
      angle: -((fp.at.angle || 0) + (invertFacing ? 180 : 0)),
      groupIndex: 0,
    }));
  const extraShape: IPersistExtraShape = {
    path: outlineShapePathBuilder_buildPathSpecString(pcbShapeData.outlines),
    x: 0,
    y: 0,
    scale: 1,
    invertY: false,
    groupIndex: 0,
  };
  return {
    formatRevision: 'LA01',
    setup: {
      placementUnit: 'mm',
      placementAnchor: 'center',
      keySizeUnit: 'KP 19.05',
      keyIdMode: 'manual',
    },
    keyEntities,
    outlineShapes: [],
    extraShape,
    transformationGroups: [{ x: 0, y: 0, angle: 0 }],
  };
}
