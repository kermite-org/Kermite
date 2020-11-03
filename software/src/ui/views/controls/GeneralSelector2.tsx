import { css } from 'goober';
import { h } from '~lib/qx';
import { reflectValue } from '~ui/base/FormHelpers';

export interface IGeneralSelector2Props {
  options: {
    text: string;
    value: string;
  }[];
  value: string;
  setValue(value: string): void;
}

const cssBase = css`
  border: solid 1px #08a;
  min-width: 100px;
  height: 28px;
`;

export const GeneralSelector2 = (props: IGeneralSelector2Props) => {
  const { options, value, setValue } = props;
  return (
    <select value={value} onChange={reflectValue(setValue)} css={cssBase}>
      {options.map((it, idx) => (
        <option value={it.value} key={`${idx}_${it.value}`}>
          {it.text}
        </option>
      ))}
    </select>
  );
};
