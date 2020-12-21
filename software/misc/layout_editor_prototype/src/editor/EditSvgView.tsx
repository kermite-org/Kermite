import { css } from 'goober';
import { IKeyEntity } from '~/editor/DataSchema';
import { appState, editManager, editMutations } from '~/editor/store';
import { h, rerender } from '~/qx';

// coord configuration
const cc = {
  baseW: 600,
  baseH: 400,
  viewScale: 0.5,
};

function startKeyEntityDragOperation(ke: IKeyEntity, e: MouseEvent) {
  let prevPos = { x: 0, y: 0 };

  let moved = false;

  const onMouseMove = (e: MouseEvent) => {
    const deltaX = e.clientX - prevPos.x;
    const deltaY = e.clientY - prevPos.y;
    ke.x += deltaX * cc.viewScale;
    ke.y += deltaY * cc.viewScale;
    prevPos.x = e.clientX;
    prevPos.y = e.clientY;
    moved = true;
    rerender();
  };

  const onMouseUp = () => {
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
    editManager.endEditSession(moved);
    rerender();
  };

  const onMouseDown = (e: MouseEvent) => {
    appState.editor.currentkeyEntityId = ke.id;
    editManager.startEditSession();

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
  `;

  const sz = 20;
  const hsz = sz / 2;

  const onMouseDown = (e: MouseEvent) => {
    startKeyEntityDragOperation(ke, e);
    e.stopPropagation();
  };

  return (
    <rect
      key={ke.id}
      x={ke.x - hsz}
      y={ke.y - hsz}
      width={sz}
      height={sz}
      css={cssKeyRect}
      data-selected={ke.id === appState.editor.currentkeyEntityId}
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
  if (appState.editor.editMode === 'move') {
    appState.editor.currentkeyEntityId = undefined;
  } else if (appState.editor.editMode === 'add') {
    const svgElement = document.getElementById('domEditSvg')!;
    const rect = svgElement.getBoundingClientRect();
    const x = (e.pageX - rect.left - cc.baseW / 2) * cc.viewScale;
    const y = (e.pageY - rect.top - cc.baseH / 2) * cc.viewScale;
    editMutations.addKeyEntity(x, y);
  }
};

export const EditSvgView = () => {
  const cssSvg = css`
    border: solid 1px #888;
  `;

  const viewBoxSpec = getViewBoxSpec();

  return (
    <svg
      width={cc.baseW}
      height={cc.baseH}
      css={cssSvg}
      viewBox={viewBoxSpec}
      onMouseDown={onSvgClick}
      id="domEditSvg"
    >
      {appState.editor.design.keyEntities.map((ke) => (
        <KeyEntityCard ke={ke} key={ke.id} />
      ))}
    </svg>
  );
};
