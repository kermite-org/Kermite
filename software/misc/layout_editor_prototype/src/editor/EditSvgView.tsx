import { css } from 'goober';
import { IKeyEntity } from '~/editor/DataSchema';
import { store } from '~/editor/store';
import { h, rerender } from '~/qx';

function startKeyEntityDragOperation(ke: IKeyEntity, e: MouseEvent) {
  let prevPos = { x: 0, y: 0 };

  const viewScale = 0.5;

  const onMouseMove = (e: MouseEvent) => {
    const deltaX = e.clientX - prevPos.x;
    const deltaY = e.clientY - prevPos.y;
    ke.x += deltaX * viewScale;
    ke.y += deltaY * viewScale;
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
  `;

  const sz = 20;
  const hsz = sz / 2;

  const onMouseDown = (e: MouseEvent) => {
    store.currentkeyEntityId = ke.id;
    startKeyEntityDragOperation(ke, e);
  };

  return (
    <rect
      key={ke.id}
      x={ke.x - hsz}
      y={ke.y - hsz}
      width={sz}
      height={sz}
      css={cssKeyRect}
      data-selected={ke.id === store.currentkeyEntityId}
      onMouseDown={onMouseDown}
    />
  );
};

export const EditSvgView = () => {
  const cssSvg = css`
    border: solid 1px #888;
  `;

  return (
    <svg width={600} height={400} css={cssSvg} viewBox="-150 -100 300 200">
      {store.design.keyEntities.map((ke) => (
        <KeyEntityCard ke={ke} key={ke.id} />
      ))}
    </svg>
  );
};
