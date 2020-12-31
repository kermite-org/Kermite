import { css } from 'goober';
import { makeCssColor } from '~/base/ColorHelper';
import { IPosition, startDragSession } from '~/base/UiInteractionHelpers';
import { uiTheme } from '~/base/uiTheme';
import { editMutations, editReader } from '~/editor/store';
import { h, rerender } from '~/qx';

const cssKeyboardOutline = css`
  fill: none;
  stroke: ${makeCssColor(0x8888ee, 0.7)};
  stroke-width: 0.5;
`;

const cssOutlinePoint = css`
  fill: transparent;
  stroke: ${makeCssColor(0x8888ee, 0.9)};
  stroke-width: 0.3;
  &[data-editable] {
    cursor: pointer;
  }

  &[data-selected] {
    stroke: ${uiTheme.colors.primary};
  }
`;

export function startOutlinePointDragOperation(e: MouseEvent) {
  const { sight, outlinePoints, currentPointIndex } = editReader;

  const point = outlinePoints[currentPointIndex];

  const destPos = { ...point };

  const moveCallback = (pos: IPosition, prevPos: IPosition) => {
    const deltaX = (pos.x - prevPos.x) * sight.scale;
    const deltaY = (pos.y - prevPos.y) * sight.scale;
    destPos.x += deltaX;
    destPos.y += deltaY;
    editMutations.setOutlinePointPosition(destPos.x, destPos.y);
    rerender();
  };
  const upCallback = () => {
    editMutations.endEdit();
    rerender();
  };
  editMutations.startEdit();
  startDragSession(e, moveCallback, upCallback);
}

const OutlinePoint = (props: { x: number; y: number; index: number }) => {
  const { x, y, index } = props;

  const { currentPointIndex } = editReader;

  const visible = true; // editorTarget === 'outline';
  const editable = true; // editMode === 'move' || editMode === 'select';
  const isSelected = index === currentPointIndex;

  const onMouseDown = (e: MouseEvent) => {
    if (editReader.editorTarget !== 'outline') {
      editMutations.setEditorTarget('outline');
    }
    const { editorTarget, editMode } = editReader;
    if (e.button === 0) {
      if (editorTarget === 'outline') {
        if (editMode === 'select') {
          editMutations.setCurrentPointIndex(index);
          editMutations.setCurrentKeyEntity(undefined);
          e.stopPropagation();
        } else if (editMode === 'move') {
          editMutations.setCurrentPointIndex(index);
          editMutations.setCurrentKeyEntity(undefined);
          startOutlinePointDragOperation(e);
          e.stopPropagation();
        }
      }
    }
  };

  const d = 1.5;
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect
        x={-d}
        y={-d}
        width={d * 2}
        height={d * 2}
        css={cssOutlinePoint}
        qxIf={visible}
        data-editable={editable}
        data-selected={isSelected}
        onMouseDown={onMouseDown}
      />
    </g>
  );
};

export const KeyboardOutline = () => {
  const { outlinePoints } = editReader;
  const pointsSpec = outlinePoints.map(({ x, y }) => `${x}, ${y}`).join(' ');
  return (
    <g>
      <polygon points={pointsSpec} css={cssKeyboardOutline} />
      {outlinePoints.map(({ x, y }, index) => (
        <OutlinePoint x={x} y={y} key={index} index={index} />
      ))}
    </g>
  );
};
