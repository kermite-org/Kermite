import { css } from 'goober';
import { h } from '~lib/qx';
import { reflectValue } from '~ui/base/FormHelpers';

export interface IGeneralSelectorViewModel {
  allOptionTexts: string[];
  currentOptionText: string;
  setCurrentOptionText: (text: string) => void;
}

const cssBase = css`
  border: solid 1px blue;
  min-width: '100px';
`;

export function GeneralSelector(props: { vm: IGeneralSelectorViewModel }) {
  const { allOptionTexts, currentOptionText, setCurrentOptionText } = props.vm;
  return (
    <select
      value={currentOptionText}
      onChange={reflectValue(setCurrentOptionText)}
      css={cssBase}
    >
      {allOptionTexts.map((optionText, idx) => (
        <option value={optionText} key={idx}>
          {optionText}
        </option>
      ))}
    </select>
  );
}
