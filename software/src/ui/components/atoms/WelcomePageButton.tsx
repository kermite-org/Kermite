import { css, FC, jsx, AluminaChildren } from 'alumina';
import { ButtonBase } from '~/ui/components/atoms/ButtonBase';

type Props = {
  className?: string;
  onClick?: () => void;
  active?: boolean;
  children?: AluminaChildren;
};

export const WelcomePageButton: FC<Props> = ({
  className,
  onClick,
  active,
  children,
}) => (
  <ButtonBase
    className={className}
    onClick={onClick}
    active={active}
    extraCss={buttonStyle}
  >
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
