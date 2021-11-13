import { jsx, css, FC } from 'alumina';
import { IDisplayKeyEntity } from '~/shared';
import { colors } from '~/ui/base';
import { KeyUnitShape } from '~/ui/elements/keyboard/keyUnitCards/KeyUnitShape';

type Props = {
  keyEntity: IDisplayKeyEntity;
};

export const ProjectKeyEntityCard: FC<Props> = ({ keyEntity }) => {
  const ke = keyEntity;
  const pos = { x: ke.x, y: ke.y, r: ke.angle || 0 };
  const { keyId: keyUnitId, shape } = ke;
  return (
    <g
      transform={`translate(${pos.x}, ${pos.y}) rotate(${pos.r}) `}
      key={keyUnitId}
    >
      <KeyUnitShape shape={shape} css={cssKeyShape} />
    </g>
  );
};

const cssKeyShape = css`
  fill: ${colors.projectKeyboard_keyFill};
  stroke: ${colors.projectKeyboard_keyEdge};
`;
