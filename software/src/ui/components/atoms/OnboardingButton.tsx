import { css, FC, jsx, QxChildren } from 'qx';
import { ButtonBase } from '~/ui/components/atoms/ButtonBase';

type Props = {
  className?: string;
  onClick?: () => void;
  children: QxChildren;
  disabled?: boolean;
};

export const OnboardingStepShiftButton: FC<Props> = ({
  className,
  onClick,
  children,
  disabled,
}) => (
  <ButtonBase
    className={className}
    onClick={onClick}
    extraCss={buttonStyle}
    disabled={disabled}
  >
    {children}
  </ButtonBase>
);

const buttonStyle = css`
  background: #def;
  border: solid 1px #47a;
  color: #47a;
  font-size: 16px;
  width: 90px;
  height: 32px;

  &:hover {
    background: #adf;
    opacity: 1;
    transition: all 0.3s;
  }
`;
