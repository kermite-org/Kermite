import { jsx, css } from 'qx';
import { GeneralInput } from '~/ui/components/atoms';
import { styleWidthSpec } from '~/ui/components/utils';

type Props = {
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
};

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
}: Props) => {
  return (
    <div css={cssEditRow}>
      <label style={styleWidthSpec(labelWidth)}>{label}</label>
      <GeneralInput
        value={editText}
        setValue={onValueChanged}
        disabled={disabled}
        invalid={!valid}
        width={inputWidth}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      <span class="unit">{unit}</span>
    </div>
  );
};

const cssEditRow = css`
  display: flex;
  align-items: center;

  > .unit {
    margin-left: 4px;
  }
`;
