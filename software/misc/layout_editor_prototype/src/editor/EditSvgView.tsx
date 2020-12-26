import { css } from 'goober';
import { makeCssColor } from '~/base/ColorHelper';
import {
  getRelativeMousePosition,
  IPosition,
  startDragSession,
} from '~/base/UiInteractionHelpers';
import { IKeyEntity } from '~/editor/DataSchema';
import { editMutations, editReader } from '~/editor/store';
import { h, rerender } from '~/qx';

// coord configuration
const cc = {
  baseW: 600,
  baseH: 400,
};

function startKeyEntityDragOperation(e: MouseEvent, useGhost: boolean) {
  const { sight } = editReader;

  const moveCallback = (pos: IPosition, prevPos: IPosition) => {
    const deltaX = (pos.x - prevPos.x) * sight.scale;
    const deltaY = (pos.y - prevPos.y) * sight.scale;
    editMutations.moveKeyDelta(deltaX, deltaY);
    rerender();
  };
  const upCallback = () => {
    editMutations.endEdit();
    rerender();
  };

  editMutations.startEdit(useGhost);
  startDragSession(e, moveCallback, upCallback);
}

function startSightDragOperation(e: MouseEvent) {
  const { sight } = editReader;

  const moveCallback = (pos: IPosition, prevPos: IPosition) => {
    const deltaX = -(pos.x - prevPos.x) * sight.scale;
    const deltaY = -(pos.y - prevPos.y) * sight.scale;
    editMutations.moveSight(deltaX, deltaY);
    rerender();
  };

  const upCallback = () => {};

  startDragSession(e, moveCallback, upCallback);
}

const KeyEntityCard = ({ ke }: { ke: IKeyEntity }) => {
  const cssKeyRect = css`
    fill: rgba(255, 255, 255, 0.3);
    stroke: #666;
    cursor: pointer;

    &[data-selected] {
      stroke: #4bb;
    }

    &[data-ghost] {
      opacity: 0.3;
    }
  `;

  const sz = 20;
  const hsz = sz / 2;

  const onMouseDown = (e: MouseEvent) => {
    const { editMode } = editReader;
    if (e.button === 0) {
      if (editMode === 'select') {
        editMutations.setCurrentKeyEntity(ke.id);
        e.stopPropagation();
      } else if (editMode === 'move') {
        editMutations.setCurrentKeyEntity(ke.id);
        startKeyEntityDragOperation(e, true);
        e.stopPropagation();
      }
    }
  };

  const isSelected = ke.id === editReader.currentKeyEntity?.id;
  const isGhost = ke === editReader.ghost;

  return (
    <rect
      key={ke.id}
      x={ke.x - hsz}
      y={ke.y - hsz}
      width={sz}
      height={sz}
      css={cssKeyRect}
      data-selected={isSelected}
      data-ghost={isGhost}
      onMouseDown={onMouseDown}
    />
  );
};

function getViewBoxSpec() {
  const w = cc.baseW;
  const h = cc.baseH;
  return `0 0 ${w} ${h}`;
}

function getTransformSpec() {
  const { sight } = editReader;
  const sc = 1 / sight.scale;
  const cx = cc.baseW / 2 - sight.pos.x * sc;
  const cy = cc.baseH / 2 - sight.pos.y * sc;
  return `translate(${cx}, ${cy}) scale(${sc})`;
}

function screenToWorld(sx: number, sy: number) {
  const { sight } = editReader;
  const x = (sx - cc.baseW / 2) * sight.scale + sight.pos.x;
  const y = (sy - cc.baseH / 2) * sight.scale + sight.pos.y;
  return [x, y];
}

const axisColor = makeCssColor(0x444444, 0.2);

const FieldAxis = () => {
  const { sight } = editReader;
  const d = 1;
  const ew = (cc.baseW / 2) * sight.scale;
  const eh = (cc.baseH / 2) * sight.scale;
  const left = -ew + sight.pos.x + d;
  const top = -eh + sight.pos.y + d;
  const right = ew + sight.pos.x - d;
  const bottom = eh + sight.pos.y - d;
  return (
    <g>
      <line x1={left} y1={0} x2={right} y2={0} stroke={axisColor} />
      <line x1={0} y1={top} x2={0} y2={bottom} stroke={axisColor} />
    </g>
  );
};

const onSvgMouseDown = (e: MouseEvent) => {
  if (e.button === 0) {
    const { editMode } = editReader;
    if (editMode === 'select' || editMode === 'move') {
      editMutations.setCurrentKeyEntity(undefined);
    } else if (editMode === 'add') {
      const [sx, sy] = getRelativeMousePosition(e);
      const [x, y] = screenToWorld(sx, sy);
      editMutations.addKeyEntity(x, y);
      startKeyEntityDragOperation(e, false);
    }
  }
  if (e.button === 1) {
    startSightDragOperation(e);
  }
};

const onSvgScroll = (e: WheelEvent) => {
  const dir = e.deltaY / 120;
  const [sx, sy] = getRelativeMousePosition(e);
  const px = sx - cc.baseW / 2;
  const py = sy - cc.baseH / 2;
  editMutations.scaleSight(dir, px, py);
};

export const EditSvgView = () => {
  const cssSvg = css`
    border: solid 1px #888;
  `;

  const viewBoxSpec = getViewBoxSpec();
  const transformSpec = getTransformSpec();
  const { ghost } = editReader;

  const showAxis = editReader.getBoolOption('showAxis');

  return (
    <svg
      width={cc.baseW}
      height={cc.baseH}
      css={cssSvg}
      viewBox={viewBoxSpec}
      onMouseDown={onSvgMouseDown}
      onWheel={onSvgScroll}
      // id="domEditSvg"
    >
      <g transform={transformSpec}>
        {editReader.allKeyEntities.map((ke) => (
          <KeyEntityCard ke={ke} key={ke.id} />
        ))}
        {ghost && <KeyEntityCard ke={ghost} />}
        {showAxis && <FieldAxis />}
      </g>
    </svg>
  );
};
