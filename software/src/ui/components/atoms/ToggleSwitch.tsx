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
  ></input>
);

const style = css`
  position: relative;
  cursor: pointer;
  width: 40px;
  height: 20px;

  &:before {
    position: absolute;
    top: 0;
    left: 0;
    display: block;
    content: '';
    width: 40px;
    height: 20px;
    border: solid 1px ${uiTheme.colors.clPrimary};
    background: ${uiTheme.colors.clControlBase};
    overflow: hidden;
    border-radius: 4px;
  }

  &:after {
    position: absolute;
    top: 0;
    left: 0;
    display: block;
    content: '';
    width: 14px;
    height: 14px;
    margin: 3px;
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
