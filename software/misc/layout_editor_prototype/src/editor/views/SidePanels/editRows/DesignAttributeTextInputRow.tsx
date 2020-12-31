import { css } from 'goober';
import { reflectValue } from '~/base/FormHelpers';
import { h } from '~/qx';

interface IDesignAttributeTextInputRowProps {
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
export const DesignAttributeTextInputRow = (
  props: IDesignAttributeTextInputRowProps
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
