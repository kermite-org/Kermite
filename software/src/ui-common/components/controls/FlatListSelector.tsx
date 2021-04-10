import { css, FC, jsx } from 'qx';
import { ISelectorOption, reflectValue } from '~/ui-common';

type Props = {
  options: ISelectorOption[];
  value: string;
  setValue: (value: string) => void;
  size: number;
  disabled?: boolean;
  className?: string;
  hint?: string;
};

const style = css`
  padding: 5px;
  font-size: 15px;
`;

export const FlatListSelector: FC<Props> = ({
  options,
  value,
  setValue,
  size,
  disabled,
  className,
  hint,
}) => (
  <select
    size={size}
    value={options.length > 0 ? value : ''}
    onInput={reflectValue(setValue)}
    css={style}
    disabled={disabled}
    className={className}
    data-hint={hint}
  >
    {options.map((it) => (
      <option value={it.value} key={it.value}>
        {it.label}
      </option>
    ))}
  </select>
);
