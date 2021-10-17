import { jsx, css, FC } from 'qx';
import { IDisplayKeyEntity } from '~/shared';
import { KeyUnitShape } from '~/ui/components/keyboard/keyUnitCards/KeyUnitShape';

type Props = {
  keyEntity: IDisplayKeyEntity;
  isHold: boolean;
};

export const LayoutPreviewKeyEntityCard: FC<Props> = ({
  keyEntity,
  isHold,
}) => {
  const ke = keyEntity;
  const pos = { x: ke.x, y: ke.y, r: ke.angle || 0 };
  const { keyId: keyUnitId, keyIndex, shape } = ke;

  return (
    <g
      transform={`translate(${pos.x}, ${pos.y}) rotate(${pos.r}) `}
      key={keyUnitId}
    >
      <KeyUnitShape
        shape={shape}
        css={cssKeyShape}
        className={isHold && '--hold'}
      />
      <text css={cssKeyText} x={0} y={0}>
        {keyIndex}
      </text>
    </g>
  );
};

const cssKeyShape = css`
  fill: rgba(0, 0, 0, 0.3);

  &.--hold {
    fill: #fa0;
  }
`;

const cssKeyText = css`
  fill: #fff;
  font-size: 8px;
  text-anchor: middle;
  dominant-baseline: central;
`;