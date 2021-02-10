import { css } from 'goober';
import { FC, h } from 'qx';
import { uiTheme, reflectValue } from '~/ui-common';
import { ISelectorOption } from '~/ui-common/base';

interface Props {
  options: ISelectorOption[];
  value: string;
  setValue(value: string): void;
  width?: number;
  className?: string;
  disabled?: boolean;
}

const style = (width: number | undefined) => css`
  border: solid 1px ${uiTheme.colors.clPrimary};
  background: ${uiTheme.colors.clControlBase};
  color: ${uiTheme.colors.clControlText};
  /* border-radius: 1px; */
  min-width: 100px;
  height: ${uiTheme.unitHeight}px;
  width: ${width ? `${width}px` : 'inherit'};
  font-size: 15px;
  cursor: pointer;
  &:focus {
    outline: none;
  }
`;

export const GeneralSelector: FC<Props> = ({
  options,
  value,
  setValue,
  className,
  width,
  disabled,
}) => (
  <select
    value={value}
    onChange={reflectValue(setValue)}
    css={style(width)}
    className={className}
    disabled={disabled}
  >
    {options.map((it, idx) => (
      <option value={it.value} key={idx}>
        {it.label}
      </option>
    ))}
  </select>
);
