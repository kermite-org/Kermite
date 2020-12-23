import { css } from 'goober';
import { IKeyEntity } from '~/editor/DataSchema';
import { editMutations, editReader } from '~/editor/store';
import { h, rerender } from '~/qx';

// coord configuration
const cc = {
  baseW: 600,
  baseH: 400,
  viewScale: 0.5,
};

function startKeyEntityDragOperation(e: MouseEvent) {
  let prevPos = { x: 0, y: 0 };

  const onMouseMove = (e: MouseEvent) => {
    const deltaX = (e.clientX - prevPos.x) * cc.viewScale;
    const deltaY = (e.clientY - prevPos.y) * cc.viewScale;
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
    editMutations.startEdit();
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
      startKeyEntityDragOperation(e);
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
  const w = cc.baseW * cc.viewScale;
  const h = cc.baseH * cc.viewScale;
  return `${-w / 2} ${-h / 2} ${w} ${h}`;
}

const onSvgClick = (e: MouseEvent) => {
  if (editReader.editMode === 'move') {
    editMutations.setCurrentKeyEntity(undefined);
  } else if (editReader.editMode === 'add') {
    const svgElement = document.getElementById('domEditSvg')!;
    const rect = svgElement.getBoundingClientRect();
    const x = (e.pageX - rect.left - cc.baseW / 2) * cc.viewScale;
    const y = (e.pageY - rect.top - cc.baseH / 2) * cc.viewScale;
    editMutations.addKeyEntity(x, y);
    startKeyEntityDragOperation(e);
  }
};

export const EditSvgView = () => {
  const cssSvg = css`
    border: solid 1px #888;
  `;

  const viewBoxSpec = getViewBoxSpec();

  const { ghost } = editReader;

  return (
    <svg
      width={cc.baseW}
      height={cc.baseH}
      css={cssSvg}
      viewBox={viewBoxSpec}
      onMouseDown={onSvgClick}
      id="domEditSvg"
    >
      {editReader.allKeyEntities.map((ke) => (
        <KeyEntityCard ke={ke} key={ke.id} />
      ))}
      {ghost && <KeyEntityCard ke={ghost} />}
    </svg>
  );
};
