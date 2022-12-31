import { FC, jsx, css } from 'alumina';
import { texts } from '~/fe-shared';
import { ButtonBase, Icon } from '../atoms';

type Props = {
  isActive: boolean;
  onClick(): void;
};

export const GlobalHintIconButton: FC<Props> = ({ isActive, onClick }) => (
  <ButtonBase
    active={isActive}
    onClick={onClick}
    class={style}
    hint={texts.statusBarHint.toggleHintMessageVisibility}
  >
    <Icon spec="info" size={18} />
  </ButtonBase>
);

const style = css`
  opacity: 0.5;
  &.active {
    opacity: 1;
  }
`;
