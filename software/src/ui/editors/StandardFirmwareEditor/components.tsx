import { css, FC, jsx, QxChildren } from 'qx';
import { GeneralInput, ToggleSwitch } from '~/ui/components';
import { standardFirmwareEditor_fieldValueConverters } from '~/ui/editors/StandardFirmwareEditor/helpers';
import { standardFirmwareEditStore } from '~/ui/editors/StandardFirmwareEditor/store';
import {
  IStandardFirmwareEditErrors,
  IStandardFirmwareEditValues,
} from '~/ui/editors/StandardFirmwareEditor/types';

const FieldItem: FC<{
  title: string;
  children: QxChildren;
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
      <td css={styleTitleCell} className={indent && '--indent'}>
        {title}
      </td>
      <td>
        <div css={styleChildren}>{children}</div>
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

type ExtractKeysWithType<Obj, Type> = {
  [K in keyof Obj]: Obj[K] extends Type ? K : never;
}[keyof Obj];

type IFlagFieldKey = ExtractKeysWithType<
  Required<IStandardFirmwareEditValues>,
  boolean
>;

type ISinglePinsFieldKey = ExtractKeysWithType<
  Required<IStandardFirmwareEditValues>,
  string
>;

type IMultiplePinsFieldKey = ExtractKeysWithType<
  Required<IStandardFirmwareEditValues>,
  string[]
>;

type IIntegerFieldKey = ExtractKeysWithType<
  Required<IStandardFirmwareEditValues>,
  number
>;

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
    <div className="error">{fieldErrors[fieldKey]}</div>
  </FieldItem>
);

const SinglePinFieldRow: FC<{
  label: string;
  fieldKey: ISinglePinsFieldKey;
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
    <div className="error">{fieldErrors[fieldKey]}</div>
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
    <div className="error">{fieldErrors[fieldKey]}</div>
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
