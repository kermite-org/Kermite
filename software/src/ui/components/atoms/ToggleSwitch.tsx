import { css, FC, jsx } from 'alumina';
import { colors } from '~/ui/base';

type Props = {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  hint?: string;
};

export const ToggleSwitch: FC<Props> = ({
  checked,
  onChange,
  disabled,
  hint,
}) => (
  <input
    type="checkbox"
    css={style}
    checked={checked}
    onChange={(e) => onChange?.(e.currentTarget.checked)}
    disabled={disabled}
    data-hint={hint}
  />
);

const style = css`
  position: relative;
  -webkit-appearance: none;
  width: 40px;
  height: 20px;
  overflow: hidden;
  background: ${colors.clControlBase};
  border: solid 1px ${colors.clPrimary};
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
    border: solid 1px ${colors.clPrimary};
    border-radius: 4px;
    transition: all 0.2s;
  }

  &:checked:after {
    left: 20px;
    background: ${colors.clPrimary};
  }

  &:hover {
    opacity: 0.7;
  }

  &:disabled {
    opacity: 0.5;
  }
`;
