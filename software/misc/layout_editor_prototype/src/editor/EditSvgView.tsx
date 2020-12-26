import { css } from 'goober';
import {
  getRelativeMousePosition,
  IPosition,
  startDragSession,
} from '~/base/UiInteractionHelpers';
import { clamp } from '~/base/utils';
import { IKeyEntity } from '~/editor/DataSchema';
import { appState, editMutations, editReader } from '~/editor/store';
import { h, rerender } from '~/qx';

// coord configuration
const cc = {
  baseW: 600,
  baseH: 400,
};

function startKeyEntityDragOperation(e: MouseEvent, useGhost: boolean) {
  const { sight } = appState.env;

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
  const { sight } = appState.env;

  const moveCallback = (pos: IPosition, prevPos: IPosition) => {
    const deltaX = (pos.x - prevPos.x) * sight.scale;
    const deltaY = (pos.y - prevPos.y) * sight.scale;
    sight.pos.x -= deltaX;
    sight.pos.y -= deltaY;
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
    if (editReader.editMode === 'move') {
      editMutations.setCurrentKeyEntity(ke.id);
      startKeyEntityDragOperation(e, true);
      e.stopPropagation();
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
  const { sight } = appState.env;
  const sc = 1 / sight.scale;
  const cx = cc.baseW / 2 - sight.pos.x * sc;
  const cy = cc.baseH / 2 - sight.pos.y * sc;
  return `translate(${cx}, ${cy}) scale(${sc})`;
}

function screenToWorld(sx: number, sy: number) {
  const { sight } = appState.env;
  const x = (sx - cc.baseW / 2) * sight.scale + sight.pos.x;
  const y = (sy - cc.baseH / 2) * sight.scale + sight.pos.y;
  return [x, y];
}

const onSvgMouseDown = (e: MouseEvent) => {
  if (e.button === 0) {
    if (editReader.editMode === 'move') {
      editMutations.setCurrentKeyEntity(undefined);
    } else if (editReader.editMode === 'add') {
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
  const { sight } = appState.env;
  const dir = e.deltaY / 120;

  const [sx, sy] = getRelativeMousePosition(e);

  const px = sx - cc.baseW / 2;
  const py = sy - cc.baseH / 2;

  const sza = 1 + dir * 0.05;
  const oldScale = sight.scale;
  const newScale = clamp(sight.scale * sza, 0.1, 10);
  sight.scale = newScale;
  const scaleDiff = newScale - oldScale;
  sight.pos.x -= px * scaleDiff;
  sight.pos.y -= py * scaleDiff;
};

export const EditSvgView = () => {
  const cssSvg = css`
    border: solid 1px #888;
  `;

  const viewBoxSpec = getViewBoxSpec();
  const transformSpec = getTransformSpec();
  const { ghost } = editReader;

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
      </g>
    </svg>
  );
};
