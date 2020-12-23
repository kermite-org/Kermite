import { css } from 'goober';
import { clamp } from '~/base/utils';
import { IKeyEntity } from '~/editor/DataSchema';
import { editMutations, editReader } from '~/editor/store';
import { h, rerender } from '~/qx';

// coord configuration
const cc = {
  baseW: 600,
  baseH: 400,
};

const sight = {
  pos: {
    x: 0,
    y: 0,
  },
  scale: 2,
};

function startKeyEntityDragOperation(e: MouseEvent, useGhost: boolean) {
  let prevPos = { x: 0, y: 0 };

  const onMouseMove = (e: MouseEvent) => {
    const deltaX = (e.clientX - prevPos.x) / sight.scale;
    const deltaY = (e.clientY - prevPos.y) / sight.scale;
    editMutations.moveKeyDelta(deltaX, deltaY);
    prevPos.x = e.clientX;
    prevPos.y = e.clientY;
    rerender();
  };

  const onMouseUp = () => {
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
    editMutations.endEdit();
    rerender();
  };

  const onMouseDown = (e: MouseEvent) => {
    editMutations.startEdit(useGhost);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    prevPos = {
      x: e.clientX,
      y: e.clientY,
    };
  };

  onMouseDown(e);
}

function startSightDragOperation(e: MouseEvent) {
  let prevPos = { x: 0, y: 0 };

  const onMouseMove = (e: MouseEvent) => {
    const deltaX = (e.clientX - prevPos.x) / sight.scale;
    const deltaY = (e.clientY - prevPos.y) / sight.scale;
    sight.pos.x -= deltaX;
    sight.pos.y -= deltaY;
    prevPos.x = e.clientX;
    prevPos.y = e.clientY;
    rerender();
  };

  const onMouseUp = () => {
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
    rerender();
  };

  const onMouseDown = (e: MouseEvent) => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    prevPos = {
      x: e.clientX,
      y: e.clientY,
    };
  };

  onMouseDown(e);
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
  const sc = sight.scale;
  const cx = cc.baseW / 2 - sight.pos.x * sc;
  const cy = cc.baseH / 2 - sight.pos.y * sc;
  return `translate(${cx}, ${cy}) scale(${sc})`;
}

const onSvgMouseDown = (e: MouseEvent) => {
  if (e.button === 0) {
    if (editReader.editMode === 'move') {
      editMutations.setCurrentKeyEntity(undefined);
    } else if (editReader.editMode === 'add') {
      const svgElement = document.getElementById('domEditSvg')!;
      const rect = svgElement.getBoundingClientRect();
      const x =
        (e.pageX - rect.left - cc.baseW / 2) / sight.scale + sight.pos.x;
      const y = (e.pageY - rect.top - cc.baseH / 2) / sight.scale + sight.pos.y;
      editMutations.addKeyEntity(x, y);
      startKeyEntityDragOperation(e, false);
    }
  }
  if (e.button === 1) {
    startSightDragOperation(e);
  }
};

const onSvgScroll = (e: WheelEvent) => {
  const dir = -e.deltaY / 120;

  const svgElement = document.getElementById('domEditSvg')!;
  const rect = svgElement.getBoundingClientRect();

  const px = e.pageX - rect.left - cc.baseW / 2;
  const py = e.pageY - rect.top - cc.baseH / 2;

  const sza = 1 + dir * 0.05;
  const oldScale = sight.scale;
  const newScale = clamp(sight.scale * sza, 0.1, 10);
  sight.scale = newScale;
  sight.pos.x += px / oldScale - px / newScale;
  sight.pos.y += py / oldScale - py / newScale;
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
      id="domEditSvg"
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
