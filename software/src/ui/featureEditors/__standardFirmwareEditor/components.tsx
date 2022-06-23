import { css, FC, jsx, AluminaChildren } from 'alumina';
import { GeneralInput, ToggleSwitch } from '~/ui/components';
import { standardFirmwareEditor_fieldValueConverters } from '~/ui/featureEditors/StandardFirmwareEditor/helpers';
import { standardFirmwareEditStore } from '~/ui/featureEditors/StandardFirmwareEditor/store';
import {
  IFlagFieldKey,
  IIntegerFieldKey,
  IMultiplePinsFieldKey,
  ISinglePinFieldKey,
  IStandardFirmwareEditErrors,
  IStandardFirmwareEditValues,
} from '~/ui/featureEditors/StandardFirmwareEditor/types';

const FieldItem: FC<{
  title: string;
  children: AluminaChildren;
  indent?: boolean;
}> = ({ title, children, indent }) => {
  const styleTitleCell = css`
    &.--indent {
      padding-left: 15px !important;
    }
  `;
  const styleChildren = css``;
  return (
    <tr>
      <td class={[styleTitleCell, indent && '--indent']}>{title}</td>
      <td>
        <div class={styleChildren}>{children}</div>
      </td>
    </tr>
  );
};

const { arrayFromText, arrayToText, integerFromText, integerToText } =
  standardFirmwareEditor_fieldValueConverters;

function valueChangeHandler<K extends keyof IStandardFirmwareEditValues>(
  key: K,
  converter?: (
    value: Extract<IStandardFirmwareEditValues[K], string | boolean>,
  ) => IStandardFirmwareEditValues[K],
) {
  return (
    rawValue: Extract<IStandardFirmwareEditValues[K], string | boolean>,
  ) => {
    const value = converter ? converter(rawValue) : rawValue;
    standardFirmwareEditStore.actions.commitValue(key, value);
  };
}

const ToggleFieldRow: FC<{
  label: string;
  fieldKey: IFlagFieldKey;
  editValues: IStandardFirmwareEditValues;
  disabled?: boolean;
}> = ({ label, fieldKey, editValues, disabled }) => (
  <FieldItem title={label}>
    <ToggleSwitch
      checked={editValues[fieldKey]}
      onChange={valueChangeHandler(fieldKey)}
      disabled={disabled}
    />
  </FieldItem>
);

const IntegerFieldRow: FC<{
  label: string;
  fieldKey: IIntegerFieldKey;
  editValues: IStandardFirmwareEditValues;
  fieldErrors: IStandardFirmwareEditErrors;
  availabilityKey?: IFlagFieldKey;
  disabled?: boolean;
  indent?: boolean;
}> = ({
  label,
  fieldKey,
  editValues,
  fieldErrors,
  availabilityKey,
  disabled,
  indent,
}) => (
  <FieldItem title={label} indent={indent}>
    <GeneralInput
      type="number"
      value={integerToText(editValues[fieldKey])}
      setValue={valueChangeHandler(fieldKey, integerFromText as any)}
      width={100}
      disabled={availabilityKey ? !editValues[availabilityKey] : disabled}
      invalid={!!fieldErrors[fieldKey]}
    />
    <div class="error">{fieldErrors[fieldKey]}</div>
  </FieldItem>
);

const SinglePinFieldRow: FC<{
  label: string;
  fieldKey: ISinglePinFieldKey;
  editValues: IStandardFirmwareEditValues;
  fieldErrors: IStandardFirmwareEditErrors;
  availabilityKey?: IFlagFieldKey;
  disabled?: boolean;
  indent?: boolean;
}> = ({
  label,
  fieldKey,
  availabilityKey,
  editValues,
  fieldErrors,
  disabled,
  indent,
}) => (
  <FieldItem title={label} indent={indent}>
    <GeneralInput
      value={editValues[fieldKey] || ''}
      setValue={valueChangeHandler(fieldKey)}
      width={100}
      disabled={availabilityKey ? !editValues[availabilityKey] : disabled}
      invalid={!!fieldErrors[fieldKey]}
    />
    <div class="error">{fieldErrors[fieldKey]}</div>
  </FieldItem>
);

const MultiplePinsFieldRow: FC<{
  label: string;
  fieldKey: IMultiplePinsFieldKey;
  availabilityKey: IFlagFieldKey;
  editValues: IStandardFirmwareEditValues;
  fieldErrors: IStandardFirmwareEditErrors;
}> = ({ label, fieldKey, availabilityKey, editValues, fieldErrors }) => (
  <FieldItem title={label} indent>
    <GeneralInput
      value={arrayToText(editValues[fieldKey])}
      setValue={valueChangeHandler(fieldKey, arrayFromText)}
      width={400}
      disabled={!editValues[availabilityKey]}
      invalid={!!fieldErrors[fieldKey]}
    />
    <div class="error">{fieldErrors[fieldKey]}</div>
  </FieldItem>
);

export const standardFirmwareEditorComponents = {
  valueChangeHandler,
  FieldItem,
  ToggleFieldRow,
  IntegerFieldRow,
  SinglePinFieldRow,
  MultiplePinsFieldRow,
};
