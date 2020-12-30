import { css } from 'goober';
import { reflectValue } from '~/base/FormHelpers';
import { ExclusiveButtonGroup } from '~/controls';
import {
  makePlacementUnitEditRowViewModel,
  makeSizeUnitSelectorViewModel,
} from '~/editor/views/SidePanels/ConfigPanel.model';
import { h } from '~/qx';

const cssUnitEditPart = css`
  > .headerRow {
  }

  > .editRow {
    margin-top: 5px;
    margin-left: 5px;
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

const PlacementUnitEditPart = () => {
  const { vmUnitInput, vmUnitMode } = makePlacementUnitEditRowViewModel();

  return (
    <div css={cssUnitEditPart}>
      <div className="headerRow">key coordinate unit</div>
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

const SizeUnitPart = () => {
  const vm = makeSizeUnitSelectorViewModel();

  return (
    <div css={cssUnitEditPart}>
      <div className="headerRow">key size unit</div>
      <div className="editRow">
        <ExclusiveButtonGroup {...vm} buttonWidth={40} />
      </div>
    </div>
  );
};

export const ConfigPanel = () => {
  const cssConfigPanel = css`
    padding: 10px;

    > * + * {
      margin-top: 10px;
    }
  `;

  return (
    <div css={cssConfigPanel}>
      <PlacementUnitEditPart />
      <SizeUnitPart />
    </div>
  );
};
