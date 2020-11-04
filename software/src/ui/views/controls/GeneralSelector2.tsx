import { css } from 'goober';
import { h } from '~lib/qx';
import { reflectValue } from '~ui/base/FormHelpers';
import { combineClasses } from '~ui/base/viewHelpers';
import { uiTheme } from '~ui/core';

const { unitHeight } = uiTheme;

export interface IGeneralSelector2Option {
  id: string;
  text: string;
}
export interface IGeneralSelector2Props {
  options: IGeneralSelector2Option[];
  choiceId: string;
  setChoiceId(key: string): void;
  width?: number;
  className?: string;
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

export const GeneralSelector2 = (props: IGeneralSelector2Props) => {
  const { options, choiceId, setChoiceId, className, width } = props;
  return (
    <select
      value={choiceId}
      onChange={reflectValue(setChoiceId)}
      css={combineClasses(cssGeneralSelector2(width), className)}
    >
      {options.map((it, idx) => (
        <option value={it.id} key={`${idx}_${it.id}`}>
          {it.text}
        </option>
      ))}
    </select>
  );
};
