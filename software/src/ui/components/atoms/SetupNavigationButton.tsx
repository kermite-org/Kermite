import { css, FC, jsx, styled } from 'qx';
import { ButtonBase } from '~/ui/components/atoms/ButtonBase';

type Props = {
  className?: string;
  onClick?: () => void;
  text: string;
  disabled?: boolean;
};

export const SetupNavigationStepShiftButton: FC<Props> = ({
  className,
  onClick,
  text,
  disabled,
}) => (
  <ButtonBase
    className={className}
    onClick={onClick}
    extraCss={buttonStyle}
    disabled={disabled}
  >
    {text}
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

export const OnboadingStepShiftButtonDummy = styled.div`
  width: 90px;
  height: 32px;
`;
