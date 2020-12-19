import { css } from 'goober';
import { IKeyEntity } from '~/editor/DataSchema';
import { appState, editManager } from '~/editor/store';
import { h, rerender } from '~/qx';

function startKeyEntityDragOperation(ke: IKeyEntity, e: MouseEvent) {
  let prevPos = { x: 0, y: 0 };

  const viewScale = 0.5;

  let moved = false;

  const onMouseMove = (e: MouseEvent) => {
    const deltaX = e.clientX - prevPos.x;
    const deltaY = e.clientY - prevPos.y;
    ke.x += deltaX * viewScale;
    ke.y += deltaY * viewScale;
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

export const EditSvgView = () => {
  const { editor } = appState;

  const cssSvg = css`
    border: solid 1px #888;
  `;

  const onSvgClick = () => {
    editor.currentkeyEntityId = undefined;
  };

  return (
    <svg
      width={600}
      height={400}
      css={cssSvg}
      viewBox="-150 -100 300 200"
      onMouseDown={onSvgClick}
    >
      {editor.design.keyEntities.map((ke) => (
        <KeyEntityCard ke={ke} key={ke.id} />
      ))}
    </svg>
  );
};
