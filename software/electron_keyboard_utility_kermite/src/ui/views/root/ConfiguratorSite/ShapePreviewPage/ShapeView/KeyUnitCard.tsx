import { css } from 'goober';
import { h } from '~lib/qx';
import { IKeyUnitEntry } from '~defs/ProfileData';
import { models } from '~ui/models';

export const KeyUnitCard = (props: {
  keyUnit: IKeyUnitEntry;
  showKeyId: boolean;
  showKeyIndex: boolean;
}) => {
  const kp = props.keyUnit;
  const pos = { x: kp.x, y: kp.y, r: kp.r || 0 };
  const { id: keyUnitId, keyIndex } = kp;

  const cssKeyRect = css`
    fill: rgba(0, 0, 0, 0.5);
  `;

  const cssKeyText = css`
    fill: #fff;
    font-size: 4px;
  `;

  return (
    <g
      transform={`translate(${pos.x}, ${pos.y}) rotate(${pos.r}) `}
      key={keyUnitId}
    >
      <rect x={-9} y={-9} width={18} height={18} css={cssKeyRect} />

      <text
        css={cssKeyText}
        x={0}
        y={-2}
        text-anchor="middle"
        dominant-baseline="center"
        qxIf={props.showKeyId}
      >
        {keyUnitId}
      </text>

      <text
        css={cssKeyText}
        x={0}
        y={4}
        text-anchor="middle"
        dominant-baseline="center"
        qxIf={props.showKeyIndex}
      >
        {keyIndex}
      </text>
    </g>
  );
};
