import { FC, css, jsx } from 'alumina';
import { reflectValue, texts } from '~/app-shared';

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
    class={style}
    data-hint={texts.assignerAssignsPaletteHint.layerInvocationModeSelector}
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
