import { vObject, vString, vBoolean } from '~/shared';

export interface IShapeViewPersistState {
  shapeViewProjectSig: string;
  shapeViewLayoutName: string;
  shapeViewShowKeyId: boolean;
  shapeViewShowKeyIndex: boolean;
  shapeViewShowBoundingBox: boolean;
}

export const shapeViewPersistStateDefault: IShapeViewPersistState = {
  shapeViewProjectSig: '',
  shapeViewLayoutName: '',
  shapeViewShowKeyId: false,
  shapeViewShowKeyIndex: false,
  shapeViewShowBoundingBox: false,
};

export const shapeViewPersistStateSchema = vObject({
  shapeViewProjectSig: vString(),
  shapeViewLayoutName: vString(),
  shapeViewShowKeyId: vBoolean(),
  shapeViewShowKeyIndex: vBoolean(),
  shapeViewShowBoundingBox: vBoolean(),
});
