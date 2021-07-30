import { jsx, css, FC } from 'qx';
import { IDisplayKeyEntity } from '~/shared';
import { uiTheme } from '~/ui/base';
import { KeyUnitShape } from '~/ui/components_svg/keyUnitCards/KeyUnitShape';

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
  fill: ${uiTheme.colors.projectKeyboard_keyFill};
  stroke: ${uiTheme.colors.projectKeyboard_keyEdge};
`;
