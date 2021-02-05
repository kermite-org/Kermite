import { css } from 'goober';
import { h } from 'qx';
import { reflectValue } from '~/ui-common';
import { combineClasses, uiTheme } from '~/ui-layouter/base';
import { ISelectOption } from '~/ui-layouter/controls';

const { colors, unitHeight } = uiTheme;

export interface IGeneralSelectorProps {
  options: ISelectOption[];
  value: string;
  setValue(value: string): void;
  width?: number;
  className?: string;
  disabled?: boolean;
}

const cssGeneralSelector = (width: number | undefined) => css`
  border: solid 1px ${colors.primary};
  height: ${unitHeight}px;
  width: ${width ? `${width}px` : 'inherit'};
  font-size: 16px;
  user-select: none;

  &:focus {
    outline: none;
  }
`;

export const GeneralSelector = (props: IGeneralSelectorProps) => {
  const { options, value, setValue, className, width, disabled } = props;
  return (
    <select
      value={value}
      onChange={reflectValue(setValue)}
      css={combineClasses(cssGeneralSelector(width), className)}
      disabled={disabled}
    >
      {options.map((it, idx) => (
        <option value={it.value} key={idx}>
          {it.label}
        </option>
      ))}
    </select>
  );
};
