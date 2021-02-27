import { h } from 'qx';
import { css } from 'qx/cssinjs';
import { IDisplayKeyEntity } from '~/shared';
import { KeyUnitShape } from '~/ui-common-svg/KeyUnitCards/KeyUnitShape';

export const PreviewKeyEntityCard = (props: {
  keyEntity: IDisplayKeyEntity;
  showKeyId: boolean;
  showKeyIndex: boolean;
}) => {
  const ke = props.keyEntity;
  const pos = { x: ke.x, y: ke.y, r: ke.angle || 0 };
  const { keyId: keyUnitId, keyIndex, shape } = ke;

  const cssKeyShape = css`
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
      <KeyUnitShape shape={shape} css={cssKeyShape} />
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
