import { css, FC, jsx } from 'qx';
import { ButtonBase } from '~/ui/components/atoms/ButtonBase';
import { multiClasses } from '~/ui/utils';

type Props = {
  onClick?: () => void;
  text: string;
  disabled?: boolean;
  small?: boolean;
};

export const SetupNavigationStepShiftButton: FC<Props> = ({
  onClick,
  text,
  disabled,
  small,
}) => (
  <ButtonBase
    className={multiClasses(buttonStyle, small && '--small')}
    onClick={onClick}
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

  &.--small {
    width: 70px;
    height: 28px;
  }

  &:not(.disabled):hover {
    background: #adf;
    opacity: 1;
    transition: all 0.3s;
  }
`;
