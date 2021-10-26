import { css, FC, jsx } from 'qx';
import { ButtonBase } from '~/ui/components/atoms/ButtonBase';

type Props = {
  handler?: () => void;
  text: string;
  active?: boolean;
  disabled?: boolean;
};

export const SetupNavigationStepButton: FC<Props> = ({
  handler,
  text,
  disabled,
  active,
}) => (
  <ButtonBase
    className={(active && '--active') || undefined}
    onClick={handler}
    extraCss={style}
    disabled={disabled}
  >
    {text}
  </ButtonBase>
);

const style = css`
  background: #def;
  border: solid 1px #47a;
  color: #47a;
  font-size: 16px;
  width: 60px;
  height: 24px;

  transition: all 0.15s;

  &:hover {
    background: #adf;
    opacity: 1;
  }

  &.--active {
    background: #adf;
  }
`;
