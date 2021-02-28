import { FC, jsx, css } from 'qx';
import { uiTheme, reflectValue } from '~/ui-common';
import { ISelectorOption } from '~/ui-common/base';

interface Props {
  options: ISelectorOption[];
  value: string;
  setValue(value: string): void;
  width?: number;
  className?: string;
  disabled?: boolean;
  hint?: string;
}

const style = (width: number | undefined) => css`
  display: block;
  border: solid 1px ${uiTheme.colors.clPrimary};
  background: ${uiTheme.colors.clControlBase};
  color: ${uiTheme.colors.clControlText};
  border-radius: ${uiTheme.controlBorderRadius}px;
  height: ${uiTheme.unitHeight}px;
  width: ${width ? `${width}px` : 'inherit'};
  font-size: 15px;
  cursor: pointer;
  &:focus {
    outline: none;
  }
  &:hover {
    opacity: 0.8;
  }
  &:disabled {
    opacity: 0.5;
  }
`;

export const GeneralSelector: FC<Props> = ({
  options,
  value,
  setValue,
  className,
  width,
  disabled,
  hint,
}) => (
  <select
    value={options.length > 0 ? value : ''}
    onChange={reflectValue(setValue)}
    css={style(width)}
    className={className}
    disabled={disabled}
    data-hint={hint}
  >
    {options.map((it, idx) => (
      <option value={it.value} key={idx}>
        {it.label}
      </option>
    ))}
  </select>
);
