import { css } from 'goober';
import { IKeyEntity } from '~/DataSchema';
import { h } from '~/qx';
import { store } from '~/store';

const KeyEntityCard = ({ entity: ke }: { entity: IKeyEntity }) => {
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

  const onClick = () => {
    store.currentkeyId = ke.id;
  };

  return (
    <rect
      key={ke.id}
      x={ke.x - hsz}
      y={ke.y - hsz}
      width={sz}
      height={sz}
      css={cssKeyRect}
      data-selected={ke.id === store.currentkeyId}
      onClick={onClick}
    ></rect>
  );
};

export const EditSvgView = () => {
  const cssSvg = css`
    border: solid 1px #888;
  `;

  return (
    <svg width={600} height={400} css={cssSvg} viewBox="-150 -100 300 200">
      {store.design.keyEntities.map((ke) => (
        <KeyEntityCard entity={ke} key={ke.id} />
      ))}
    </svg>
  );
};
