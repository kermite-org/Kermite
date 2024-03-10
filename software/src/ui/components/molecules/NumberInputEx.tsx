import { FC, css, jsx, useState } from 'alumina';
import { isNumberInRange } from '~/shared';
import { GeneralInput } from '~/ui/components/atoms';

interface Props {
  value: number;
  setValue(value: number): void;
  width?: number;
  disabled?: boolean;
  hint?: string;
  min: number;
  max: number;
  unit?: string;
}

export const NumberInputEx: FC<Props> = ({
  value,
  setValue,
  width,
  disabled,
  hint,
  min,
  max,
  unit,
}) => {
  const [valid, setValid] = useState(true);

  const handleChangeValue = (text: string) => {
    const value = parseFloat(text);
    const _valid = isFinite(value) && isNumberInRange(value, min, max);
    if (_valid) {
      setValue(value);
    }
    if (valid !== _valid) {
      setValid(_valid);
    }
  };
  return (
    <div class={style}>
      <GeneralInput
        type="number"
        min={min}
        max={max}
        value={value.toString()}
        setValue={handleChangeValue}
        width={width}
        disabled={disabled}
        hint={hint}
        invalid={!valid}
      />
      <span>{unit}</span>
    </div>
  );
};

const style = css`
  display: flex;
  align-items: center;
  gap: 4px;
`;
