import { css } from 'goober';
import { IKeyEntity } from '~/DataSchema';
import { h, Hook, rerender } from '~/qx';
import { store } from '~/store';

function makeEntityCardBehaviorModel(ke: IKeyEntity) {
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
    store.currentkeyId = ke.id;

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    prevPos = {
      x: e.clientX,
      y: e.clientY,
    };
  };

  return {
    onMouseDown,
  };
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

  const behavior = Hook.useMemo(() => makeEntityCardBehaviorModel(ke), [ke.id]);

  const sz = 20;
  const hsz = sz / 2;

  return (
    <rect
      key={ke.id}
      x={ke.x - hsz}
      y={ke.y - hsz}
      width={sz}
      height={sz}
      css={cssKeyRect}
      data-selected={ke.id === store.currentkeyId}
      onMouseDown={behavior.onMouseDown}
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
