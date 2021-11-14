import { jsx, css, FC } from 'alumina';
import { IDisplayKeyEntity } from '~/shared';
import { KeyUnitShape } from '~/ui/elements/keyboard/keyUnitCards/KeyUnitShape';

type Props = {
  keyEntity: IDisplayKeyEntity;
  showKeyId: boolean;
  showKeyIndex: boolean;
};

export const PreviewKeyEntityCard: FC<Props> = ({
  keyEntity,
  showKeyId,
  showKeyIndex,
}) => {
  const ke = keyEntity;
  const pos = { x: ke.x, y: ke.y, r: ke.angle || 0 };
  const { keyId: keyUnitId, keyIndex, shape } = ke;

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
        qxIf={showKeyId}
      >
        {keyUnitId}
      </text>

      <text
        css={cssKeyText}
        x={0}
        y={4}
        text-anchor="middle"
        dominant-baseline="center"
        qxIf={showKeyIndex}
      >
        {keyIndex}
      </text>
    </g>
  );
};

const cssKeyShape = css`
  fill: rgba(0, 0, 0, 0.5);
`;

const cssKeyText = css`
  fill: #fff;
  font-size: 4px;
`;
