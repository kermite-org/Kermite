import { css } from 'goober';
import { h } from '~lib/qx';
import { reflectValue } from '~ui/views/base/FormHelpers';
import { makeLayerOptionEditViewModel } from './LayerOptionEdit.model';

export const LayerOptionEdit = () => {
  const {
    enabled,
    allValues,
    selectedValue,
    onValueChanged
  } = makeLayerOptionEditViewModel();

  const cssBase = css`
    margin-left: 10px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  `;

  return (
    <div css={cssBase}>
      <select
        value={selectedValue}
        onChange={reflectValue(onValueChanged)}
        disabled={!enabled}
      >
        {allValues.map((mode) => (
          <option key={mode} value={mode}>
            {mode}
          </option>
        ))}
      </select>
    </div>
  );
};
