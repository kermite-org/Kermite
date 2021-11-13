import { jsx, css, FC } from 'alumina';
import { texts } from '~/ui/base';
import { reflectValue } from '~/ui/utils';

type Props = {
  enabled: boolean;
  allValues: string[];
  selectedValue: string;
  onValueChanged(value: string): void;
};

export const OperationLayerOptionSelector: FC<Props> = ({
  enabled,
  allValues,
  selectedValue,
  onValueChanged,
}) => (
  <div
    css={style}
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

const style = css`
  margin-left: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;
