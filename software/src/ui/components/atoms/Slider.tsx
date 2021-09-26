import { FC, jsx } from 'qx';
import { reflectValue } from '~/ui/utils';

interface Props {
  min: number;
  max: number;
  value: number;
  onChange(value: number): void;
}

export const Slider: FC<Props> = (props) => {
  const handleChange = reflectValue((value) =>
    props.onChange(parseFloat(value)),
  );
  return (
    <input
      type="range"
      value={props.value}
      min={props.min}
      max={props.max}
      onInput={handleChange}
    />
  );
};
