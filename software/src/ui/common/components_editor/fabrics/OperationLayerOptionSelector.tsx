import { jsx, css } from 'qx';
import { texts } from '~/ui/common/base';
import { reflectValue } from '~/ui/common/helpers';

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
      data-hint={texts.hint_assigner_assigns_layerInvocationModeSelector}
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
