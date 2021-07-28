import { css, FC, jsx } from 'qx';
import { uiTheme, withStopPropagation } from '~/ui/common';

type Props = {
  layerName: string;
  isActive: boolean;
  onClick: () => void;
};

const style = css`
  color: ${uiTheme.colors.clAltText};
  padding: 0 4px;
  user-select: none;
  cursor: pointer;
  &[data-active] {
    background: #0cc;
  }
  &:hover {
    opacity: 0.7;
  }
`;

export const PresetLayerItem: FC<Props> = ({
  layerName,
  isActive,
  onClick,
}) => (
  <div
    css={style}
    onClick={withStopPropagation(onClick)}
    data-active={isActive}
  >
    {layerName}
  </div>
);
