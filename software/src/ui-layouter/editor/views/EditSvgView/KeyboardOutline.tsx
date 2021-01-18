import { css } from 'goober';
import { rerender, h } from 'qx';
import {
  makeCssColor,
  uiTheme,
  IPosition,
  startDragSession,
} from '~/ui-layouter/base';
import { degToRad } from '~/ui-layouter/base/utils';
import {
  editReader,
  editMutations,
  IOutlinePoint,
  IEditOutlineShape,
  ITransGroup,
} from '~/ui-layouter/editor/store';
import { getWorldMousePositionOnEditSvg } from './CoordHelpers';

function applyInverseGroupTransform(
  wx: number,
  wy: number,
  group: ITransGroup | undefined,
  isMirror: boolean,
) {
  const mirrorMultX = isMirror ? -1 : 1;
  const ox = group ? group.x : 0;
  const oy = group ? group.y : 0;
  const theta = -degToRad(group?.angle || 0) * mirrorMultX;
  const m0x = wx - ox * mirrorMultX;
  const m0y = wy - oy;
  const mx = m0x * Math.cos(theta) - m0y * Math.sin(theta);
  const my = m0x * Math.sin(theta) + m0y * Math.cos(theta);
  return [mx, my];
}

const cssKeyboardOutlineShapeView = css`
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

export function startOutlinePointDragOperation(
  e: MouseEvent,
  emitStartEdit: boolean,
  isMirror: boolean,
) {
  const {
    sight,
    outlinePoints,
    currentPointIndex,
    currentOutlineShape,
  } = editReader;

  if (!outlinePoints || !currentOutlineShape) {
    return;
  }

  const point = outlinePoints[currentPointIndex];
  const group = editReader.getTransGroupById(currentOutlineShape.groupId);

  const destPos = {
    x: point.x,
    y: point.y,
  };

  const moveCallback = (pos: IPosition, prevPos: IPosition) => {
    const deltaX = (pos.x - prevPos.x) * sight.scale;
    const deltaY = (pos.y - prevPos.y) * sight.scale;

    const mirrorMultX = isMirror ? -1 : 1;
    const theta = -degToRad(group?.angle || 0) * mirrorMultX;
    const deltaXM = deltaX * Math.cos(theta) - deltaY * Math.sin(theta);
    const deltaYM = deltaX * Math.sin(theta) + deltaY * Math.cos(theta);
    destPos.x += deltaXM * mirrorMultX;
    destPos.y += deltaYM;

    editMutations.setOutlinePointPosition(destPos.x, destPos.y);
    rerender();
  };
  const upCallback = () => {
    editMutations.endEdit();
    rerender();
  };
  if (emitStartEdit) {
    editMutations.startEdit();
  }

  startDragSession(e, moveCallback, upCallback);
}

const OutlinePoint = (props: {
  x: number;
  y: number;
  index: number;
  shapeId: string;
  isMirror: boolean;
}) => {
  const { x, y, index, shapeId, isMirror } = props;
  const { currentShapeId, currentPointIndex } = editReader;

  const visible = true; // editorTarget === 'outline';
  const editable = true; // editMode === 'move' || editMode === 'select';
  const isSelected = shapeId === currentShapeId && index === currentPointIndex;

  const onMouseDown = (e: MouseEvent) => {
    if (editReader.editorTarget !== 'outline') {
      editMutations.setEditorTarget('outline');
    }
    const { editorTarget, editMode } = editReader;
    if (e.button === 0) {
      if (editorTarget === 'outline') {
        if (editMode === 'select') {
          editMutations.setCurrentShapeId(shapeId);
          editMutations.setCurrentPointIndex(index);
          editMutations.unsetCurrentKeyEntity();
          e.stopPropagation();
        } else if (editMode === 'move' || editMode === 'add') {
          editMutations.setCurrentShapeId(shapeId);
          editMutations.setCurrentPointIndex(index);
          editMutations.unsetCurrentKeyEntity();
          startOutlinePointDragOperation(e, true, isMirror);
          e.stopPropagation();
        } else if (editMode === 'delete') {
          editMutations.setCurrentShapeId(shapeId);
          editMutations.setCurrentPointIndex(index);
          editMutations.deleteCurrentOutlinePoint();
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

interface IHittestLineViewModel {
  dstPointIndex: number;
  p0: IOutlinePoint;
  p1: IOutlinePoint;
  shapeId: string;
}

function makeHittestLineViewModel(
  pointIndex: number,
  points: IOutlinePoint[],
  shapeId: string,
) {
  const dstPointIndex = (pointIndex + 1) % points.length;
  const p0 = points[pointIndex];
  const p1 = points[dstPointIndex];
  return {
    dstPointIndex,
    p0,
    p1,
    shapeId,
  };
}

const cssHittestLine = css`
  stroke-width: 1;
  stroke: transparent;
  cursor: crosshair;
  /* stroke: rgba(255, 0, 128, 0.2); */
`;

const HittestLine = (props: {
  vm: IHittestLineViewModel;
  isMirror: boolean;
}) => {
  const { isMirror } = props;
  const { p0, p1, dstPointIndex, shapeId } = props.vm;

  const onMouseDown = (e: MouseEvent) => {
    if (e.button === 0) {
      const [wx, wy] = getWorldMousePositionOnEditSvg(e);
      const shape = editReader.getOutlineShapeById(shapeId);
      const group = editReader.getTransGroupById(shape?.groupId || '');
      const [mx, my] = applyInverseGroupTransform(wx, wy, group, isMirror);
      const mirrorMultX = isMirror ? -1 : 1;

      editMutations.startEdit();
      editMutations.unsetCurrentKeyEntity();
      editMutations.setCurrentShapeId(shapeId);
      editMutations.splitOutlineLine(dstPointIndex, mx * mirrorMultX, my);
      editMutations.setCurrentPointIndex(dstPointIndex);
      startOutlinePointDragOperation(e, false, isMirror);
      e.stopPropagation();
    }
  };

  return (
    <line
      x1={p0.x}
      y1={p0.y}
      x2={p1.x}
      y2={p1.y}
      css={cssHittestLine}
      onMouseDown={onMouseDown}
    />
  );
};

export const KeyboardOutlineShapeViewSingle = (props: {
  shape: IEditOutlineShape;
  isMirror: boolean;
}) => {
  const { shape, isMirror } = props;
  const { points, id: shapeId } = shape;
  const pointsSpec = points.map(({ x, y }) => `${x}, ${y}`).join(' ');
  const vmLines = points.map((_, idx) =>
    makeHittestLineViewModel(idx, points, shapeId),
  );

  const group = editReader.getTransGroupById(shape.groupId);
  const ox = group ? group.x : 0;
  const oy = group ? group.y : 0;
  const orot = group ? group.angle : 0;
  const mirrorMultX = isMirror ? -1 : 1;
  const outerTransformSpec = `scale(${mirrorMultX}, 1) translate(${ox}, ${oy}) rotate(${orot})`;

  return (
    <g transform={outerTransformSpec}>
      <polygon points={pointsSpec} css={cssKeyboardOutlineShapeView} />
      <g>
        {vmLines.map((vm) => (
          <HittestLine key={vm.dstPointIndex} vm={vm} isMirror={isMirror} />
        ))}
      </g>
      <g>
        {points.map(({ x, y }, index) => (
          <OutlinePoint
            x={x}
            y={y}
            key={index}
            index={index}
            shapeId={shapeId}
            isMirror={isMirror}
          />
        ))}
      </g>
    </g>
  );
};

export const KeyboardOutlineShapeView = (props: {
  shape: IEditOutlineShape;
}) => {
  const { shape } = props;
  const group = editReader.getTransGroupById(shape.groupId);
  if (group?.mirror) {
    return (
      <g>
        <KeyboardOutlineShapeViewSingle shape={shape} isMirror={false} />
        <KeyboardOutlineShapeViewSingle shape={shape} isMirror={true} />
      </g>
    );
  } else {
    return <KeyboardOutlineShapeViewSingle shape={shape} isMirror={false} />;
  }
};
