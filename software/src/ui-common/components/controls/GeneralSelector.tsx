import { css } from 'goober';
import { h } from 'qx';
import { uiTheme, reflectValue } from '~/ui-common';

const { unitHeight } = uiTheme;

export interface IGeneralSelectorOption {
  value: string;
  label: string;
}

export interface IGeneralSelectorViewModel {
  options: IGeneralSelectorOption[];
  value: string;
  setValue(value: string): void;
}

export interface IGeneralSelectorProps {
  options: IGeneralSelectorOption[];
  value: string;
  setValue(value: string): void;
  width?: number;
  className?: string;
  disabled?: boolean;
}

const cssGeneralSelector = (width: number | undefined) => css`
  border: solid 1px ${uiTheme.colors.clPrimary};
  background: ${uiTheme.colors.clControlBase};
  color: ${uiTheme.colors.clPrimary};
  min-width: 100px;
  height: ${unitHeight}px;
  width: ${width ? `${width}px` : 'inherit'};
  font-size: 16px;
  cursor: pointer;
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
      classNames={[cssGeneralSelector(width), className]}
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
