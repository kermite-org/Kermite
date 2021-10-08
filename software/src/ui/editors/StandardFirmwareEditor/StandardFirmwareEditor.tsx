import { css, FC, jsx } from 'qx';
import { IKermiteStandardKeyboardSpec } from '~/shared';
import { appUi } from '~/ui/base';
import { GeneralInput, GeneralSelector, ToggleSwitch } from '~/ui/components';
import { FieldItem } from '~/ui/editors/StandardFirmwareEditor/FieldItem';
import {
  standardFirmwareEditModelHelpers,
  standardFirmwareEditor_fieldValueConverters,
} from '~/ui/editors/StandardFirmwareEditor/helpers';
import { useStandardFirmwareEditPresenter } from '~/ui/editors/StandardFirmwareEditor/presenter';
import { standardFirmwareEditStore } from '~/ui/editors/StandardFirmwareEditor/store';
import {
  IStandardFirmwareEditErrors,
  IStandardFirmwareEditValues,
} from '~/ui/editors/StandardFirmwareEditor/types';

export type Props = {
  firmwareConfig: IStandardFirmwareEditValues;
  isNewConfig: boolean;
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

export const StandardFirmwareEditor_OutputPropsSupplier = {
  get isModified(): boolean {
    return standardFirmwareEditStore.readers.isModified;
  },
  get canSave(): boolean {
    return standardFirmwareEditStore.readers.canSave;
  },
  emitSavingEditValues(): IKermiteStandardKeyboardSpec {
    return standardFirmwareEditModelHelpers.cleanupSavingFirmwareConfig(
      standardFirmwareEditStore.state.editValues,
    );
  },
};

export const StandardFirmwareEditor: FC<Props> = ({
  firmwareConfig,
  isNewConfig,
}) => {
  const {
    baseFirmwareTypeOptions,
    editValues,
    isAvr,
    isRp,
    isSplit,
    isOddSplit,
    availablePinsText,
    fieldErrors,
    totalError,
  } = useStandardFirmwareEditPresenter(firmwareConfig, isNewConfig);

  return (
    <div css={style}>
      <div>standard firmware configuration</div>
      <table className="config-table">
        <tbody>
          <FieldItem title="base firmware type">
            <GeneralSelector
              options={baseFirmwareTypeOptions}
              value={editValues.baseFirmwareType}
              setValue={valueChangeHandler('baseFirmwareType')}
            />
          </FieldItem>
          <ToggleFieldRow
            label="use board LEDs ProMicro"
            fieldKey="useBoardLedsProMicroAvr"
            editValues={editValues}
            qxIf={isAvr}
          />
          <ToggleFieldRow
            label="use board LEDs ProMicro RP2040"
            fieldKey="useBoardLedsProMicroRp"
            editValues={editValues}
            qxIf={isRp}
          />
          <ToggleFieldRow
            label="use board LEDs RPi Pico"
            fieldKey="useBoardLedsRpiPico"
            editValues={editValues}
            qxIf={isRp}
          />
          <ToggleFieldRow
            fieldKey="useMatrixKeyScanner"
            label="use matrix key scanner"
            editValues={editValues}
          />
          <MultiplePinsFieldRow
            label="row pins"
            fieldKey="matrixRowPins"
            availabilityKey="useMatrixKeyScanner"
            editValues={editValues}
            fieldErrors={fieldErrors}
          />
          <MultiplePinsFieldRow
            label="column pins"
            fieldKey="matrixColumnPins"
            availabilityKey="useMatrixKeyScanner"
            editValues={editValues}
            fieldErrors={fieldErrors}
          />

          <MultiplePinsFieldRow
            label="row pins right"
            fieldKey="matrixRowPinsR"
            availabilityKey="useMatrixKeyScanner"
            editValues={editValues}
            fieldErrors={fieldErrors}
            qxIf={isOddSplit}
          />
          <MultiplePinsFieldRow
            label="column pins right"
            fieldKey="matrixColumnPinsR"
            availabilityKey="useMatrixKeyScanner"
            editValues={editValues}
            fieldErrors={fieldErrors}
            qxIf={isOddSplit}
          />

          <ToggleFieldRow
            label="use direct wired key scanner"
            fieldKey="useDirectWiredKeyScanner"
            editValues={editValues}
          />
          <MultiplePinsFieldRow
            label="direct wired pins"
            fieldKey="directWiredPins"
            availabilityKey="useDirectWiredKeyScanner"
            editValues={editValues}
            fieldErrors={fieldErrors}
          />
          <MultiplePinsFieldRow
            label="direct wired pins right"
            fieldKey="directWiredPinsR"
            availabilityKey="useDirectWiredKeyScanner"
            editValues={editValues}
            fieldErrors={fieldErrors}
            qxIf={isOddSplit}
          />
          <ToggleFieldRow
            label="use encoder"
            fieldKey="useEncoder"
            editValues={editValues}
          />
          <MultiplePinsFieldRow
            label="encoder pins"
            fieldKey="encoderPins"
            availabilityKey="useEncoder"
            editValues={editValues}
            fieldErrors={fieldErrors}
          />
          <MultiplePinsFieldRow
            label="encoder pins right"
            fieldKey="encoderPinsR"
            availabilityKey="useEncoder"
            editValues={editValues}
            fieldErrors={fieldErrors}
            qxIf={isOddSplit}
          />
          <ToggleFieldRow
            fieldKey="useLighting"
            label="use lighting"
            editValues={editValues}
          />
          <SinglePinFieldRow
            label="lighting pin"
            fieldKey="lightingPin"
            editValues={editValues}
            fieldErrors={fieldErrors}
            disabled={!(editValues.useLighting && isRp)}
            indent={true}
          />
          <IntegerFieldRow
            label="lighting num LEDs"
            fieldKey="lightingNumLeds"
            editValues={editValues}
            fieldErrors={fieldErrors}
            availabilityKey="useLighting"
            indent={true}
          />
          <IntegerFieldRow
            label="lighting num LEDs right"
            fieldKey="lightingNumLedsR"
            editValues={editValues}
            fieldErrors={fieldErrors}
            availabilityKey="useLighting"
            indent={true}
            qxIf={isOddSplit}
          />

          <ToggleFieldRow
            fieldKey="useLcd"
            label="use OLED"
            editValues={editValues}
            disabled={isAvr && isSplit}
          />

          <SinglePinFieldRow
            label="single wire signal pin"
            fieldKey="singleWireSignalPin"
            editValues={editValues}
            fieldErrors={fieldErrors}
            qxIf={isSplit}
          />

          <ToggleFieldRow
            fieldKey="useDebugUart"
            label="use debug uart"
            editValues={editValues}
            qxIf={appUi.isDevelopment}
          />

          <FieldItem title="available pins">{availablePinsText}</FieldItem>
        </tbody>
      </table>
      <div className="total-error" qxIf={!!totalError}>
        {totalError}
      </div>
      <div qxIf={false}>{JSON.stringify(editValues)}</div>
    </div>
  );
};

const style = css`
  > .config-table {
    margin-top: 10px;

    td {
      padding: 4px 5px;
    }
  }

  table {
    .error {
      color: #f44;
    }
  }

  > .total-error {
    margin-left: 5px;
    margin-top: 10px;
    color: #f44;
  }
`;
