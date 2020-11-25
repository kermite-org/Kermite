import { css } from 'goober';
import { h } from '~lib/qx';
import { reflectValue } from '~ui/base/helper/FormHelpers';
import { combineClasses } from '~ui/base/helper/ViewHelpers';
import { uiTheme } from '~ui/core';

const { unitHeight } = uiTheme;

export interface IGeneralSelectorOption {
  id: string;
  text: string;
}

export interface IGeneralSelectorViewModel {
  options: IGeneralSelectorOption[];
  choiceId: string;
  setChoiceId(key: string): void;
}

export interface IGeneralSelectorProps {
  options: IGeneralSelectorOption[];
  choiceId: string;
  setChoiceId(key: string): void;
  width?: number;
  className?: string;
  disabled?: boolean;
}

const cssGeneralSelector2 = (width: number | undefined) => css`
  border: solid 1px #08a;
  min-width: 100px;
  height: ${unitHeight}px;
  width: ${width ? `${width}px` : 'inherit'};
  font-size: 16px;
  &:focus {
    outline: none;
  }
`;

export const GeneralSelector = (props: IGeneralSelectorProps) => {
  const { options, choiceId, setChoiceId, className, width, disabled } = props;
  return (
    <select
      value={choiceId}
      onChange={reflectValue(setChoiceId)}
      css={combineClasses(cssGeneralSelector2(width), className)}
      disabled={disabled}
    >
      {options.map((it, idx) => (
        <option value={it.id} key={idx}>
          {it.text}
        </option>
      ))}
    </select>
  );
};
