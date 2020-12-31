import { css } from 'goober';
import { reflectValue } from '~/base/FormHelpers';
import { styleWidthSpec } from '~/base/ViewHelpers';
import { IConfigTextEditModel } from '~/editor/views/SidePanels/commonViewModels/ConfigTextEditModel';
import { h } from '~/qx';

const cssEditRow = css`
  display: flex;
  align-items: center;

  > input {
    &[data-invalid] {
      background: #fcc;
    }
  }

  > .unit {
    margin-left: 4px;
  }
`;

export const GeneralConfigTextEditRow = (props: {
  model: IConfigTextEditModel;
  label: string;
  labelWidth: number;
  inputWidth: number;
  unit?: string;
}) => {
  const { model, label, labelWidth, inputWidth, unit } = props;
  return (
    <div css={cssEditRow}>
      <label style={styleWidthSpec(labelWidth)}>{label}</label>
      <input
        type="text"
        value={model.editText}
        onInput={reflectValue(model.onValueChanged)}
        onFocus={model.onFocus}
        onBlur={model.onBlur}
        disabled={model.disabled}
        data-invalid={!model.valid}
        style={styleWidthSpec(inputWidth)}
      />
      <span class="unit">{unit}</span>
    </div>
  );
};
