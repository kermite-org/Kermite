import { FC, jsx, css } from 'qx';
import { uiTheme } from '~/ui/base';
import { ToggleSwitch } from '~/ui/components/atoms/ToggleSwitch';

interface Props {
  className?: string;
  checked: boolean;
  onChange?: (value: boolean) => void;
  text: string;
  disabled?: boolean;
  hint?: string;
  textSide?: 'left' | 'right';
}

export const ToggleSwitchLine: FC<Props> = ({
  className,
  checked,
  onChange,
  text,
  disabled,
  hint,
  textSide = 'left',
}) => (
  <div
    css={style}
    classNames={[className, disabled && '--disabled']}
    data-hint={hint}
  >
    <span qxIf={textSide === 'left'}>{text}</span>
    <ToggleSwitch checked={checked} onChange={onChange} disabled={disabled} />
    <span qxIf={textSide === 'right'}>{text}</span>
  </div>
);

const style = css`
  height: ${uiTheme.unitHeight}px;
  display: flex;
  align-items: center;
  gap: 5px;

  > span {
    color: ${uiTheme.colors.clPrimary};
    font-size: 15px;
  }

  &.--disabled > span {
    opacity: 0.5;
  }
`;
