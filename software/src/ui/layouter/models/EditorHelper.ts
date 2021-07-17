import { IEditState } from '~/ui/layouter/models/AppState';
import {
  IEditOutlinePoint,
  IEditOutlineShape,
} from '~/ui/layouter/models/DataSchema';

export function draftGetEditShape(
  editor: IEditState,
): IEditOutlineShape | undefined {
  if (editor.drawingShape) {
    return editor.drawingShape;
  }
  return editor.design.outlineShapes[editor.currentShapeId || ''];
}

export function draftGetEditPoint(
  editor: IEditState,
): IEditOutlinePoint | undefined {
  const shape = draftGetEditShape(editor);
  const { currentPointIndex } = editor;
  if (shape && currentPointIndex !== -1) {
    return shape.points[currentPointIndex];
  }
  return undefined;
}
