import { jsx, css } from 'qx';
import { reflectValue } from '~/ui-common';

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
    <div
      css={cssOperationLayerOptionSelector}
      data-hint="レイヤ呼び出しモードを指定します。"
    >
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
