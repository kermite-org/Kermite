import { css } from 'goober';
import { reflectValue } from '~/base/FormHelpers';
import { usePropertyPanelModel } from '~/editor/viewModels/PropertiesPanel.model2';
import { h } from '~/qx';

interface IDesignAttributeTextInputLineProps {
  model: {
    label: string;
    unit: string;
    editText: string;
    setEditText(text: string): void;
    hasError: boolean;
    onFocus(): void;
    onBlur(): void;
    canEdit: boolean;
  };
}

const DesignAttributeTextInputLine = (
  props: IDesignAttributeTextInputLineProps
) => {
  const cssInput = css`
    &[data-has-error] {
      background: rgba(255, 0, 0, 0.3);
    }
  `;
  const {
    label,
    unit,
    editText,
    setEditText,
    hasError,
    onFocus,
    onBlur,
    canEdit,
  } = props.model;

  return (
    <div>
      <label>{label}</label>
      <input
        css={cssInput}
        type="text"
        value={editText}
        onInput={reflectValue(setEditText)}
        onFocus={onFocus}
        onBlur={onBlur}
        data-has-error={hasError}
        readOnly={!canEdit}
      />
      <span>{unit}</span>
    </div>
  );
};

export const PropertiesPanel = () => {
  const vm = usePropertyPanelModel().keyEntityAttrsVm;

  const cssPropertiesPanel = css`
    padding: 10px;
    label {
      display: inline-block;
      width: 80px;
    }
    input {
      width: 60px;
    }

    display: flex;
    flex-direction: column;
    /* height: 100%; */

    > .editZone {
      flex-grow: 1;
    }

    > .errorZone {
      > .errorText {
        color: red;
      }
    }
  `;

  return (
    <div css={cssPropertiesPanel}>
      <div className="editZone">
        {vm.slots.map((slot) => (
          <DesignAttributeTextInputLine key={slot.propKey} model={slot} />
        ))}
      </div>
      <div qxIf={!!vm.errorText} className="errorZone">
        <span className="errorText">{vm.errorText}</span>
      </div>
    </div>
  );
};
