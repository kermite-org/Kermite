import { css, FC, jsx, AluminaChildren } from 'alumina';
import { ButtonBase } from '~/ui/components/atoms/ButtonBase';

type Props = {
  onClick?: () => void;
  active?: boolean;
  children?: AluminaChildren;
  hint?: string;
};

export const WelcomePageButton: FC<Props> = ({
  onClick,
  active,
  children,
  hint,
}) => (
  <ButtonBase onClick={onClick} active={active} class={buttonStyle} hint={hint}>
    {children}
  </ButtonBase>
);

const buttonStyle = css`
  color: #345;
  /* border: solid 1px #345; */
  background: #cde;
  height: 90px;
  font-size: 20px;

  &:hover {
    opacity: 0.7;
    transition: all 0.5s;
  }

  &.active {
    background: #9ce;
  }
`;
