import { FC, h, css } from 'qx';
import { ButtonBase, Icon } from '~/ui-common/components';

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
  <ButtonBase active={isActive} onClick={onClick} extraCss={style}>
    <Icon spec="info" size={18} />
  </ButtonBase>
);
