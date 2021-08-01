import { css, FC, jsx } from 'qx';
import { uiTheme } from '~/ui/base';

type Props = {
  className?: string;
  checked: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
};

export const ToggleSwitch: FC<Props> = ({
  className,
  checked,
  onChange,
  disabled,
}) => (
  <input
    type="checkbox"
    css={style}
    className={className}
    checked={checked}
    onChange={(e) => onChange?.(e.currentTarget.checked)}
    disabled={disabled}
  />
);

const style = css`
  position: relative;
  -webkit-appearance: none;
  width: 40px;
  height: 20px;
  overflow: hidden;
  background: ${uiTheme.colors.clControlBase};
  border: solid 1px ${uiTheme.colors.clPrimary};
  border-radius: 4px;
  cursor: pointer;
  outline: none;

  &:after {
    position: absolute;
    top: 0;
    left: 0;
    display: block;
    content: '';
    width: 14px;
    height: 14px;
    margin: 1px;
    border: solid 1px ${uiTheme.colors.clPrimary};
    border-radius: 4px;
    transition: all 0.2s;
  }

  &:checked:after {
    left: 20px;
    background: ${uiTheme.colors.clPrimary};
  }

  &:hover {
    opacity: 0.7;
  }

  &:disabled {
    opacity: 0.5;
  }
`;
