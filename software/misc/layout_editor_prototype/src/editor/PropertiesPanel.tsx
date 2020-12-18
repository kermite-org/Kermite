import { css } from 'goober';
import { reflectValue } from '~/base/FormHelpers';
import { usePropertyPanelModel } from '~/editor/PropertiesPanel.model2.mvvm';
import { h } from '~/qx';

interface IDesignAttributeTextInputLineProps {
  label: string;
  editText: string;
  setEditText(text: string): void;
  hasError: boolean;
  onFocus(): void;
  resetError(): void;
  canEdit: boolean;
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
    editText,
    setEditText,
    hasError,
    onFocus,
    resetError,
    canEdit,
  } = props;

  return (
    <div>
      <label>{label}</label>
      <input
        css={cssInput}
        type="text"
        value={editText}
        onInput={reflectValue(setEditText)}
        onFocus={onFocus}
        data-has-error={hasError}
        readOnly={!canEdit}
      />
      {hasError && <button onClick={resetError}>x</button>}
    </div>
  );
};

export const PropertiesPanel = () => {
  const vm = usePropertyPanelModel().keyEntityAttrsVm;

  const cssPropertiesPanel = css`
    label {
      display: inline-block;
      width: 60px;
    }
    input {
      width: 60px;
    }

    display: flex;
    flex-direction: column;
    height: 100%;

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
          <DesignAttributeTextInputLine key={slot.propKey} {...slot} />
        ))}
      </div>
      <div qxIf={!!vm.errorText} className="errorZone">
        <span className="errorText">{vm.errorText}</span>
      </div>
    </div>
  );
};
