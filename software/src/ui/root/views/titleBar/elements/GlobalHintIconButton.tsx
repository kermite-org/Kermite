import { FC, jsx, css } from 'qx';
import { texts } from '~/ui/base';
import { ButtonBase, Icon } from '~/ui/components';

type Props = {
  isActive: boolean;
  onClick(): void;
};

const style = css`
  opacity: 0.5;
  &.active {
    opacity: 1;
  }
`;

export const GlobalHintIconButton: FC<Props> = ({ isActive, onClick }) => (
  <ButtonBase
    active={isActive}
    onClick={onClick}
    extraCss={style}
    hint={texts.hint_statusBar_toggleHintMessageVisibility}
  >
    <Icon spec="info" size={18} />
  </ButtonBase>
);
