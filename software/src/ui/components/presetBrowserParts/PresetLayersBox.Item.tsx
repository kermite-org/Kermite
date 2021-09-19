import { css, FC, jsx } from 'qx';
import { uiTheme } from '~/ui/base';
import { withStopPropagation } from '~/ui/utils';

type Props = {
  layerName: string;
  isActive: boolean;
  onClick: () => void;
};

export const PresetLayersBoxItem: FC<Props> = ({
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

  transition: ${uiTheme.commonTransitionSpec};
`;
