import { css } from 'goober';
import { makeCssColor } from '~/base/ColorHelper';
import {
  getRelativeMousePosition,
  IPosition,
  startDragSession,
} from '~/base/UiInteractionHelpers';
import { editMutations, editReader, IKeyEntity } from '~/editor/models';
import { ICoordUnit, unitValueToMm } from '~/editor/models/PlacementUnitHelper';
import { DebugOverlay } from '~/editor/views/DebugOverlay';
import { h, Hook, rerender } from '~/qx';

// coord configuration
const cc = {
  baseW: 600,
  baseH: 400,
};

function startKeyEntityDragOperation(e: MouseEvent, useGhost: boolean) {
  const { sight, currentKeyEntity: ck, coordUnit } = editReader;

  const [kx, ky] = unitValueToMm(ck!.x, ck!.y, coordUnit);
  const destPos = { x: kx, y: ky };

  const moveCallback = (pos: IPosition, prevPos: IPosition) => {
    const deltaX = (pos.x - prevPos.x) * sight.scale;
    const deltaY = (pos.y - prevPos.y) * sight.scale;
    destPos.x += deltaX;
    destPos.y += deltaY;
    editMutations.setKeyPosition(destPos.x, destPos.y);
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

function getStdKeySize(shapeSpec: string, coordUnit: ICoordUnit) {
  const baseW = coordUnit.mode === 'KP' ? coordUnit.x : 19;
  const baseH = coordUnit.mode === 'KP' ? coordUnit.y : 19;
  if (shapeSpec.startsWith('std')) {
    const [, p1, p2] = shapeSpec.split(' ');
    const uw = (p1 && parseFloat(p1)) || 1;
    const uh = (p2 && parseFloat(p2)) || 1;
    return [uw * baseW - 1, uh * baseH - 1];
  }
  return [baseW - 1, baseH - 1];
}

// no shrink
// const isoEnterPathMarkupText = [
//   'M -16.625, -19',
//   'L -16.625, 0',
//   'L -11.875, 0',
//   'L -11.875, 19',
//   'L 11.875, 19',
//   'L 11.875, -19',
//   'z',
// ].join(' ');

// shrink 0.5
const isoEnterPathMarkupText = [
  'M -16.125, -18.5',
  'L -16.125, -0.5',
  'L -11.375, -0.5',
  'L -11.375, 18.5',
  'L 11.375, 18.5',
  'L 11.375, -18.5',
  'z',
].join(' ');

const KeyEntityCard = ({
  ke,
  coordUnit,
}: {
  ke: IKeyEntity;
  coordUnit: ICoordUnit;
}) => {
  const cssKeyRect = css`
    fill: rgba(255, 255, 255, 0.3);
    stroke-width: 0.5;
    stroke: #666;
    cursor: pointer;

    &[data-selected] {
      stroke: #4bb;
    }

    &[data-ghost] {
      opacity: 0.3;
    }
  `;

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

  const x = coordUnit.mode === 'KP' ? ke.x * coordUnit.x : ke.x;
  const y = coordUnit.mode === 'KP' ? ke.y * coordUnit.y : ke.y;

  const transformSpec = `translate(${x}, ${y}) rotate(${ke.r})`;

  if (ke.shape === 'ext circle') {
    return (
      <g transform={transformSpec}>
        <circle
          cx={0}
          cy={0}
          r={9}
          css={cssKeyRect}
          data-selected={isSelected}
          data-ghost={isGhost}
          onMouseDown={onMouseDown}
        />
      </g>
    );
  }

  if (ke.shape === 'ext isoEnter') {
    return (
      <g transform={transformSpec}>
        <path
          d={isoEnterPathMarkupText}
          css={cssKeyRect}
          data-selected={isSelected}
          data-ghost={isGhost}
          onMouseDown={onMouseDown}
        />
      </g>
    );
  }

  const [keyW, keyH] = getStdKeySize(ke.shape, coordUnit);
  return (
    <g transform={transformSpec}>
      <rect
        x={-keyW / 2}
        y={-keyH / 2}
        width={keyW}
        height={keyH}
        css={cssKeyRect}
        data-selected={isSelected}
        data-ghost={isGhost}
        onMouseDown={onMouseDown}
      />
    </g>
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
const gridColor = makeCssColor(0x444444, 0.1);

function getWorldViewBounds() {
  const { sight } = editReader;
  const d = 1;
  const ew = (cc.baseW / 2) * sight.scale;
  const eh = (cc.baseH / 2) * sight.scale;
  const left = -ew + sight.pos.x + d;
  const top = -eh + sight.pos.y + d;
  const right = ew + sight.pos.x - d;
  const bottom = eh + sight.pos.y - d;
  return {
    left,
    top,
    right,
    bottom,
  };
}

const FieldAxis = () => {
  const { left, top, right, bottom } = getWorldViewBounds();
  return (
    <g>
      <line
        x1={left}
        y1={0}
        x2={right}
        y2={0}
        stroke={axisColor}
        stroke-width={0.5}
      />
      <line
        x1={0}
        y1={top}
        x2={0}
        y2={bottom}
        stroke={axisColor}
        stroke-width={0.5}
      />
    </g>
  );
};

function makeRange(lo: number, hi: number) {
  return new Array(hi - lo + 1).fill(0).map((_, i) => lo + i);
}

const FieldGrid = () => {
  const { left, top, right, bottom } = getWorldViewBounds();
  const [gpx, gpy] = editReader.gridPitches;

  const nl = (left / gpx) >> 0;
  const nt = (top / gpy) >> 0;
  const nr = (right / gpx) >> 0;
  const nb = (bottom / gpy) >> 0;

  const xs = makeRange(nl, nr).map((ix) => ix * gpx);
  const ys = makeRange(nt, nb).map((iy) => iy * gpy);

  return (
    <g>
      <g>
        {ys.map((y) => (
          <line
            key={y}
            x1={left}
            y1={y}
            x2={right}
            y2={y}
            stroke={gridColor}
            stroke-width={0.5}
          />
        ))}
      </g>
      <g>
        {xs.map((x) => (
          <line
            key={x}
            x1={x}
            y1={top}
            x2={x}
            y2={bottom}
            stroke={gridColor}
            stroke-width={0.5}
          />
        ))}
      </g>
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

const EditSvgViewInternal = (props: { baseW: number; baseH: number }) => {
  cc.baseW = props.baseW;
  cc.baseH = props.baseH;

  const viewBoxSpec = getViewBoxSpec();
  const transformSpec = getTransformSpec();
  const { ghost, showAxis, showGrid } = editReader;

  const { coordUnit } = editReader;

  return (
    <svg
      width={cc.baseW}
      height={cc.baseH}
      viewBox={viewBoxSpec}
      onMouseDown={onSvgMouseDown}
      onWheel={onSvgScroll}
      id="domEditSvg"
    >
      <g transform={transformSpec}>
        {showGrid && <FieldGrid />}
        {showAxis && <FieldAxis />}
        {ghost && <KeyEntityCard ke={ghost} coordUnit={coordUnit} />}

        {editReader.allKeyEntities.map((ke) => (
          <KeyEntityCard ke={ke} key={ke.id} coordUnit={coordUnit} />
        ))}
      </g>
    </svg>
  );
};

export const EditSvgView = () => {
  const cssSvgView = css`
    border: solid 1px #888;
    flex-grow: 1;
    overflow: hidden;
    max-height: calc(100vh - 97px);
    position: relative;
  `;

  const [areaSize, setAreaSize] = Hook.useState({ w: 100, h: 100 });

  Hook.useSideEffect(() => {
    const el = document.getElementById('domEditSvgOuterDiv');
    if (el) {
      const cw = el.clientWidth;
      const ch = el.clientHeight;
      if (!(cw === areaSize.w && ch === areaSize.h)) {
        setAreaSize({ w: cw, h: ch });
        return true;
      }
    }
  });

  return (
    <div css={cssSvgView} id="domEditSvgOuterDiv">
      <EditSvgViewInternal baseW={areaSize.w} baseH={areaSize.h} />
      <DebugOverlay />
    </div>
  );
};
