import { IEditState } from '~/ui/editors/LayoutEditor/models/AppState';
import {
  IEditOutlinePoint,
  IEditOutlineShape,
} from '~/ui/editors/LayoutEditor/models/DataSchema';

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

export function applyCoordSnapping(
  x: number,
  y: number,
  snapPitches: { x: number; y: number },
): [number, number] {
  const gpx = snapPitches.x;
  const gpy = snapPitches.y;
  x = Math.round(x / gpx) * gpx;
  y = Math.round(y / gpy) * gpy;
  return [x, y];
}
