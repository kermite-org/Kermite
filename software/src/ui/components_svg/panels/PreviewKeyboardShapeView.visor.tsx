import { jsx } from 'qx';
import { IPersistKeyboardDesign } from '~/shared';
import { DisplayKeyboardDesignLoader } from '~/shared/modules/DisplayKeyboardDesignLoader';
import { PreviewKeyboardShapeView } from '~/ui/components_svg/panels/PreviewKeyboardShapeView';

const sourceDesign: IPersistKeyboardDesign = {
  formatRevision: 'LA01',
  setup: {
    placementUnit: 'mm',
    placementAnchor: 'center',
    keySizeUnit: 'KP 19.05',
    keyIdMode: 'manual',
  },
  keyEntities: [
    { keyId: 'KL0', x: 28, y: -19, keyIndex: 0, groupIndex: 0 },
    { keyId: 'KL1', x: 9, y: -19, keyIndex: 1, groupIndex: 0 },
    { keyId: 'KL2', x: -10, y: -19, keyIndex: 2, groupIndex: 0 },
    { keyId: 'KL3', x: -29, y: -19, keyIndex: 3, groupIndex: 0 },
    { keyId: 'KL4', x: 11, y: -19, keyIndex: 4, groupIndex: 1 },
    { keyId: 'KL5', x: -8, y: -19, keyIndex: 5, groupIndex: 1 },
    { keyId: 'KL6', x: 28.5, y: 0, keyIndex: 6, groupIndex: 0 },
    { keyId: 'KL7', x: 9.5, y: 0, keyIndex: 7, groupIndex: 0 },
    { keyId: 'KL8', x: -9.5, y: 0, keyIndex: 8, groupIndex: 0 },
    { keyId: 'KL9', x: -28.5, y: 0, keyIndex: 9, groupIndex: 0 },
    { keyId: 'KL10', x: 9.5, y: 0, keyIndex: 10, groupIndex: 1 },
    { keyId: 'KL11', x: -9.5, y: 0, keyIndex: 11, groupIndex: 1 },
    { keyId: 'KL12', x: 29, y: 19, keyIndex: 12, groupIndex: 0 },
    { keyId: 'KL13', x: 10, y: 19, keyIndex: 13, groupIndex: 0 },
    { keyId: 'KL14', x: -9, y: 19, keyIndex: 14, groupIndex: 0 },
    { keyId: 'KL15', x: -28, y: 19, keyIndex: 15, groupIndex: 0 },
    { keyId: 'KL16', x: 8, y: 19, keyIndex: 16, groupIndex: 1 },
    { keyId: 'KL17', x: -11, y: 19, keyIndex: 17, groupIndex: 1 },
    { keyId: 'KL18', x: 35, y: 41.5, keyIndex: 18, groupIndex: 0 },
    { keyId: 'KL19', x: 16, y: 41.5, keyIndex: 19, groupIndex: 0 },
    { keyId: 'KL20', x: -3, y: 41.5, keyIndex: 20, groupIndex: 0 },
    { keyId: 'KL21', x: -22, y: 41.5, keyIndex: 21, groupIndex: 0 },
    { keyId: 'KL22', x: 7.5, y: 42, keyIndex: 22, groupIndex: 1 },
    { keyId: 'KL23', x: -12, y: 42, keyIndex: 23, groupIndex: 1 },
    { keyId: 'KR0', mirrorOf: 'KL0', keyIndex: 24 },
    { keyId: 'KR1', mirrorOf: 'KL1', keyIndex: 25 },
    { keyId: 'KR2', mirrorOf: 'KL2', keyIndex: 26 },
    { keyId: 'KR3', mirrorOf: 'KL3', keyIndex: 27 },
    { keyId: 'KR4', mirrorOf: 'KL4', keyIndex: 28 },
    { keyId: 'KR5', mirrorOf: 'KL5', keyIndex: 29 },
    { keyId: 'KR6', mirrorOf: 'KL6', keyIndex: 30 },
    { keyId: 'KR7', mirrorOf: 'KL7', keyIndex: 31 },
    { keyId: 'KR8', mirrorOf: 'KL8', keyIndex: 32 },
    { keyId: 'KR9', mirrorOf: 'KL9', keyIndex: 33 },
    { keyId: 'KR10', mirrorOf: 'KL10', keyIndex: 34 },
    { keyId: 'KR11', mirrorOf: 'KL11', keyIndex: 35 },
    { keyId: 'KR12', mirrorOf: 'KL12', keyIndex: 36 },
    { keyId: 'KR13', mirrorOf: 'KL13', keyIndex: 37 },
    { keyId: 'KR14', mirrorOf: 'KL14', keyIndex: 38 },
    { keyId: 'KR15', mirrorOf: 'KL15', keyIndex: 39 },
    { keyId: 'KR16', mirrorOf: 'KL16', keyIndex: 40 },
    { keyId: 'KR17', mirrorOf: 'KL17', keyIndex: 41 },
    { keyId: 'KR18', mirrorOf: 'KL18', keyIndex: 42 },
    { keyId: 'KR19', mirrorOf: 'KL19', keyIndex: 43 },
    { keyId: 'KR20', mirrorOf: 'KL20', keyIndex: 44 },
    { keyId: 'KR21', mirrorOf: 'KL21', keyIndex: 45 },
    { keyId: 'KR22', mirrorOf: 'KL22', keyIndex: 46 },
    { keyId: 'KR23', mirrorOf: 'KL23', keyIndex: 47 },
  ],
  outlineShapes: [
    {
      points: [
        { x: 145, y: 97.7 },
        { x: 145, y: 0 },
        { x: -145, y: 0 },
        { x: -145, y: 97.7 },
        { x: -25, y: 111 },
        { x: 25, y: 111 },
      ],
    },
  ],
  transformationGroups: [
    { x: -54.5, y: 44, angle: 9, mirror: true },
    { x: -113.5, y: 38, mirror: true },
  ],
};

const design = DisplayKeyboardDesignLoader.loadDisplayKeyboardDesign(
  sourceDesign,
);

export const PreviewKeyboardShapeViewExamples = {
  default: () => (
    <div style="width: 100%; height: 400px;">
      <PreviewKeyboardShapeView
        keyboardDesign={design}
        settings={{
          shapeViewShowKeyId: true,
          shapeViewShowKeyIndex: true,
          shapeViewShowBoundingBox: false,
        }}
      />
    </div>
  ),
};
