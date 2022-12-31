import { FC, css, jsx } from 'alumina';
import { ISelectorOption, reflectValue } from '~/app-shared';

interface Props {
  options: ISelectorOption[];
  value: string;
  setValue: (value: string) => void;
  size: number;
  disabled?: boolean;
  hint?: string;
}

export const FlatListSelector: FC<Props> = ({
  options,
  value,
  setValue,
  size,
  disabled,
  hint,
}) => (
  <select
    size={size}
    value={options.length > 0 ? value : ''}
    onInput={reflectValue(setValue)}
    class={style}
    disabled={disabled}
    data-hint={hint}
  >
    {options.map((it) => (
      <option value={it.value} key={it.value}>
        {it.label}
      </option>
    ))}
  </select>
);

const style = css`
  padding: 5px;
  font-size: 15px;
  outline: none;

  > option {
    cursor: pointer;
  }
`;
