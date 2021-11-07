import { css, FC, jsx } from 'qx';
import { uiTheme } from '~/ui/base';

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
  <button
    classNames={[style, active && '--active']}
    onClick={handler}
    disabled={disabled}
  >
    {text}
  </button>
);

const style = css`
  cursor: pointer;
  user-select: none;
  display: flex;
  justify-content: center;
  align-items: center;

  transition: ${uiTheme.commonTransitionSpec};
  background: #def;
  border: solid 1px #47a;
  color: #47a;
  font-size: 16px;
  width: 60px;
  height: 24px;

  &.--active {
    background: #adf;
  }

  &:hover {
    background: #adf;
  }

  &:disabled {
    pointer-events: none;
    cursor: inherit;
    opacity: 0.5;
  }
`;
