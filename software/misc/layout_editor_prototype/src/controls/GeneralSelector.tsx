import { css } from 'goober';
import { reflectValue } from '~/base/FormHelpers';
import { combineClasses } from '~/base/ViewHelpers';
import { uiTheme } from '~/base/uiTheme';
import { ISelectOption } from '~/controls/interfaces';
import { h } from '~/qx';

const { colors, unitHeight } = uiTheme;

export interface IGeneralSelectorProps {
  options: ISelectOption[];
  choiceId: string;
  setChoiceId(key: string): void;
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
  const { options, choiceId, setChoiceId, className, width, disabled } = props;
  return (
    <select
      value={choiceId}
      onChange={reflectValue(setChoiceId)}
      css={combineClasses(cssGeneralSelector(width), className)}
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
