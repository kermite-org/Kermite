import { FC, jsx, css } from 'alumina';
import { colors, uiTheme } from '~/app-shared';
import { ToggleSwitch } from '../atoms';

interface Props {
  checked: boolean;
  onChange?: (value: boolean) => void;
  text: string;
  disabled?: boolean;
  hint?: string;
  textSide?: 'left' | 'right';
}

export const ToggleSwitchLine: FC<Props> = ({
  checked,
  onChange,
  text,
  disabled,
  hint,
  textSide = 'left',
}) => (
  <div class={[style, disabled && '--disabled']} data-hint={hint}>
    <span if={textSide === 'left'}>{text}</span>
    <ToggleSwitch checked={checked} onChange={onChange} disabled={disabled} />
    <span if={textSide === 'right'}>{text}</span>
  </div>
);

const style = css`
  height: ${uiTheme.unitHeight}px;
  display: flex;
  align-items: center;
  gap: 5px;

  > span {
    color: ${colors.clPrimary};
    font-size: 15px;
  }

  &.--disabled > span {
    opacity: 0.5;
  }
`;
