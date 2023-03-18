import { FC, jsx } from 'alumina';
import { isNumberInRange } from '~/shared';
import { GeneralInput } from '~/ui/components/atoms';

interface Props {
  value: number;
  setValue(value: number): void;
  width?: number;
  disabled?: boolean;
  hint?: string;
  min?: number;
  max?: number;
}

export const NumberInput: FC<Props> = ({
  value,
  setValue,
  width,
  disabled,
  hint,
  min,
  max,
}) => {
  const handleChangeValue = (text: string) => {
    const value = parseFloat(text);
    if (isFinite(value)) {
      if (min !== undefined && max !== undefined) {
        if (!isNumberInRange(value, min, max)) {
          return;
        }
      }
      setValue(value);
    }
  };
  return (
    <GeneralInput
      type="number"
      min={min}
      max={max}
      value={value.toString()}
      setValue={handleChangeValue}
      width={width}
      disabled={disabled}
      hint={hint}
    />
  );
};
