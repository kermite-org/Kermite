import { css } from 'goober';
import { h } from '~lib/qx';
import { reflectValue } from '~ui/base/helper/FormHelpers';

const cssOperationLayerOptionSelector = css`
  margin-left: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

export const OperationLayerOptionSelector = (props: {
  enabled: boolean;
  allValues: string[];
  selectedValue: string;
  onValueChanged(value: string): void;
}) => {
  const { enabled, allValues, selectedValue, onValueChanged } = props;

  return (
    <div css={cssOperationLayerOptionSelector}>
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