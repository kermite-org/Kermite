import { vObject, vString, vBoolean } from '~/shared';

export interface IShapeViewPersistState {
  shapeViewProjectKey: string;
  shapeViewLayoutName: string;
  shapeViewShowKeyId: boolean;
  shapeViewShowKeyIndex: boolean;
  shapeViewShowBoundingBox: boolean;
}

export const shapeViewPersistStateDefault: IShapeViewPersistState = {
  shapeViewProjectKey: '',
  shapeViewLayoutName: '',
  shapeViewShowKeyId: false,
  shapeViewShowKeyIndex: false,
  shapeViewShowBoundingBox: false,
};

export const shapeViewPersistStateSchema = vObject({
  shapeViewProjectKey: vString(),
  shapeViewLayoutName: vString(),
  shapeViewShowKeyId: vBoolean(),
  shapeViewShowKeyIndex: vBoolean(),
  shapeViewShowBoundingBox: vBoolean(),
});
