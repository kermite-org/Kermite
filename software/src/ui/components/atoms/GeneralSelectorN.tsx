import { FC, jsx } from 'alumina';
import { ISelectorOptionN } from '~/ui/base';
import { GeneralSelector } from '~/ui/components/atoms/GeneralSelector';

interface Props {
  options: ISelectorOptionN[];
  value: number;
  setValue(value: number): void;
  width?: number;
  className?: string;
  disabled?: boolean;
  hint?: string;
  forceControlled?: boolean;
}

export const GeneralSelectorN: FC<Props> = ({
  options,
  value,
  setValue,
  ...restProps
}) => {
  const modOptions = options.map((it) => ({
    value: it.value.toString(),
    label: it.label,
  }));
  const strValue = value.toString();
  const onChange = (newStrValue: string) => {
    setValue(parseInt(newStrValue));
  };
  return (
    <GeneralSelector
      options={modOptions}
      value={strValue}
      setValue={onChange}
      {...restProps}
    />
  );
};
