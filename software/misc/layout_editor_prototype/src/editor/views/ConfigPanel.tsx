import { css } from 'goober';
import { reflectValue } from '~/base/FormHelpers';
import { ExclusiveButtonGroup } from '~/controls';
import { makePlacementUnitEditRowViewModel } from '~/editor/views/ConfigPanel.model';
import { h } from '~/qx';

const PlacementUnitEditPart = () => {
  const { vmUnitInput, vmUnitMode } = makePlacementUnitEditRowViewModel();

  const cssUnitEditPart = css`
    > .editRow {
      display: flex;
      align-items: center;

      > input {
        width: 90px;
        margin-left: 4px;
      }
    }
    > .errorRow {
      color: red;
    }
  `;
  return (
    <div css={cssUnitEditPart}>
      <div>unit</div>
      <div className="editRow">
        <ExclusiveButtonGroup {...vmUnitMode} buttonWidth={40} />
        <input
          type="text"
          value={vmUnitInput.editText}
          onInput={reflectValue(vmUnitInput.onValueChanged)}
          onBlur={vmUnitInput.onBlur}
          disabled={vmUnitInput.disabled}
        />
        <span>mm</span>
      </div>
      <div className="errorRow">
        {!vmUnitInput.valid && 'invalid keypitch specificaion'}
      </div>
    </div>
  );
};

export const ConfigPanel = () => {
  const cssConfigPanel = css`
    padding: 10px;
  `;

  return (
    <div css={cssConfigPanel}>
      <PlacementUnitEditPart />
    </div>
  );
};
