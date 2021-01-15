import { reflectValue } from '@kermite/ui';
import { styleWidthSpec } from '@ui-layouter/base';
import { css } from 'goober';
import { h } from 'qx';

interface IProps {
  editText: string;
  valid: boolean;
  disabled: boolean;
  onValueChanged(text: string): void;
  onFocus(): void;
  onBlur(): void;
  label: string;
  labelWidth: number;
  inputWidth: number;
  unit?: string;
}

const cssEditRow = css`
  display: flex;
  align-items: center;

  > input {
    &[data-invalid] {
      background: #fcc;
    }
  }

  > .unit {
    margin-left: 4px;
  }
`;

export const GeneralConfigTextEditRow = ({
  editText,
  valid,
  disabled,
  onValueChanged,
  onFocus,
  onBlur,
  label,
  labelWidth,
  inputWidth,
  unit,
}: IProps) => {
  return (
    <div css={cssEditRow}>
      <label style={styleWidthSpec(labelWidth)}>{label}</label>
      <input
        type="text"
        value={editText}
        onInput={reflectValue(onValueChanged)}
        onFocus={onFocus}
        onBlur={onBlur}
        disabled={disabled}
        data-invalid={!valid}
        style={styleWidthSpec(inputWidth)}
      />
      <span class="unit">{unit}</span>
    </div>
  );
};
