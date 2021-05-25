import { FC, jsx, css } from 'qx';
import { ButtonBase, Icon, texts } from '~/ui/common';

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
