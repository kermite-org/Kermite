import { jsx, css, FC } from 'qx';
import { IDisplayKeyEntity } from '~/shared';
import { KeyUnitShape } from '~/ui/components/keyboard/keyUnitCards/KeyUnitShape';
import { IDraftLayoutLabelEntity } from '~/ui/features/ProjectQuickSetupPart/ProjectQuickSetupPartTypes';

type Props = {
  keyEntity: IDisplayKeyEntity;
  labelEntities: IDraftLayoutLabelEntity[];
  isHold: boolean;
};

export const LayoutPreviewKeyEntityCard: FC<Props> = ({
  keyEntity,
  labelEntities,
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
      <g>
        {labelEntities.map((le) => (
          <text
            key={le.pinType}
            css={cssLabelText}
            class={`--type-${le.pinType}`}
          >
            {le.pinName}
          </text>
        ))}
      </g>
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

const cssLabelText = css`
  fill: #222;
  font-size: 6px;
  text-anchor: middle;
  dominant-baseline: central;

  &.--type-column {
    transform: translateY(-14px);
  }

  &.--type-rowL {
    transform: translateX(-18px);
  }

  &.--type-rowR {
    transform: translateX(18px);
  }

  &.--type-itself {
    transform: translateY(6px);
  }
`;
