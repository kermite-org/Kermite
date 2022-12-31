import { css, FC, jsx } from 'alumina';
import { colors, uiTheme, withStopPropagation } from '~/fe-shared';

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
    class={style}
    onClick={withStopPropagation(onClick)}
    data-active={isActive}
  >
    {layerName}
  </div>
);

const style = css`
  color: ${colors.clAltText};
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
