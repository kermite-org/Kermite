import { css } from 'goober';
import { h } from '~lib/qx';
import { reflectValue } from '~ui/base/FormHelpers';
import { combineClasses } from '../helpers/viewHelpers';

export interface IGeneralSelector2Option {
  id: string;
  text: string;
}
export interface IGeneralSelector2Props {
  options: IGeneralSelector2Option[];
  choiceId: string;
  setChoiceId(key: string): void;
  className?: string;
}

const cssGeneralSelector2 = css`
  border: solid 1px #08a;
  min-width: 100px;
  height: 28px;

  &:focus {
    outline: none;
  }
`;

export const GeneralSelector2 = (props: IGeneralSelector2Props) => {
  const { options, choiceId, setChoiceId, className } = props;
  return (
    <select
      value={choiceId}
      onChange={reflectValue(setChoiceId)}
      css={combineClasses(cssGeneralSelector2, className)}
    >
      {options.map((it, idx) => (
        <option value={it.id} key={`${idx}_${it.id}`}>
          {it.text}
        </option>
      ))}
    </select>
  );
};
