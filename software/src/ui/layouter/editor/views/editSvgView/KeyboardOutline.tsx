import { rerender, jsx, css } from 'qx';
import { degToRad } from '~/shared';
import { makeCssColor, uiTheme } from '~/ui/common';
import { IPosition, startDragSession } from '~/ui/layouter/base';
import {
  editReader,
  editMutations,
  IEditOutlinePoint,
  IEditOutlineShape,
  IEditTransGroup,
} from '~/ui/layouter/editor/store';
import { getWorldMousePositionOnEditSvg } from './CoordHelpers';

function applyInverseGroupTransform(
  wx: number,
  wy: number,
  group: IEditTransGroup | undefined,
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
    stroke: ${uiTheme.colors.clPrimary};
  }

  &:hover {
    opacity: 0.7;
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
    const { editorTarget, editMode, shapeDrawing } = editReader;
    if (e.button === 0) {
      if (
        editorTarget === 'outline' &&
        editMode === 'add' &&
        shapeDrawing
        // index === 0
      ) {
        // shapeを閉じる
        editMutations.endShapeDrawing();
        editMutations.setCurrentShapeId(undefined);
        editMutations.unsetCurrentKeyEntity();
        editMutations.setCurrentPointIndex(-1);
        e.stopPropagation();
        return;
      }

      if (editorTarget === 'outline') {
        if (editMode === 'select') {
          editMutations.setCurrentShapeId(shapeId);
          editMutations.setCurrentPointIndex(index);
          editMutations.unsetCurrentKeyEntity();
          e.stopPropagation();
        } else if (editMode === 'move' || editMode === 'add') {
          editMutations.unsetCurrentKeyEntity();
          editMutations.setCurrentShapeId(shapeId);
          editMutations.setCurrentPointIndex(index);
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
  p0: IEditOutlinePoint;
  p1: IEditOutlinePoint;
  shapeId: string;
}

function makeHittestLineViewModel(
  pointIndex: number,
  points: IEditOutlinePoint[],
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

// X=0で左右の辺を共有するミラー指定された外形のパスを、左右で結合して描画できるかを確認するための実験
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const KeyboardOutlineJoinedShapeDrawingTest = (props: {
  shape: IEditOutlineShape;
}) => {
  const { shape } = props;
  const group = editReader.getTransGroupById(shape.groupId);
  if (!(group?.mirror && group.angle === 0 && group.x === 0)) {
    return null;
  }
  const { points } = shape;
  if (points.length < 3) {
    return null;
  }
  const sharedEdgePointIndex = points.findIndex((point, idx) => {
    const nextPoint = points[(idx + 1) % points.length];
    return point.x === 0 && nextPoint.x === 0;
  });
  if (sharedEdgePointIndex === -1) {
    return null;
  }
  const sortedPoints = points.map(
    (_, idx) => points[(sharedEdgePointIndex + 1 + idx) % points.length],
  );
  const altSidePoints = sortedPoints
    .slice()
    .reverse()
    .slice(1, sortedPoints.length - 1)
    .map((p) => ({ x: -p.x, y: p.y }));

  const allPoints = [...sortedPoints, ...altSidePoints];

  const pointsSpec = allPoints.map(({ x, y }) => `${x}, ${y}`).join(' ');

  const oy = group ? group.y : 0;
  const outerTransformSpec = `translate(0, ${oy})`;

  const cssTestJoinedShape = css`
    fill: ${makeCssColor(0x00ff00, 0.5)};
    stroke: blue;
    stroke-width: 1.5;
  `;

  return (
    <g transform={outerTransformSpec}>
      <polygon points={pointsSpec} css={cssTestJoinedShape} />
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
        {/* <KeyboardOutlineJoinedShapeDrawingTest shape={shape} /> */}
      </g>
    );
  } else {
    return <KeyboardOutlineShapeViewSingle shape={shape} isMirror={false} />;
  }
};
