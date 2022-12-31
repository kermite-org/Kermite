import { FC, css, jsx } from 'alumina';
import { GeneralInput, styleWidthSpec } from '../../components';

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

export const GeneralConfigTextEditRow: FC<Props> = ({
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
}) => (
  <div class={style}>
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

const style = css`
  display: flex;
  align-items: center;

  > .unit {
    margin-left: 4px;
  }
`;
