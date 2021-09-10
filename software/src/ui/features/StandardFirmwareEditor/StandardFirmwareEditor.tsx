import { css, FC, jsx, QxChildren, QxNode, useEffect } from 'qx';
import { GeneralInput, GeneralSelector, ToggleSwitch } from '~/ui/components';
import {
  IStandardFirmwareEditValues,
  standardFirmwareEditModel,
} from '~/ui/features/StandardFirmwareEditor/StandardFirmwareEditModel';
import { standardFirmwareEditModelHelpers } from '~/ui/features/StandardFirmwareEditor/StandardFirmwareEditModel.helpers';

export type Props = {
  firmwareConfig: IStandardFirmwareEditValues;
  saveHandler?(firmwareConfig: IStandardFirmwareEditValues): void;
};

function arrayToText(arr: string[] | undefined): string {
  return arr?.join(', ') || '';
}

function arrayFromText(text: string): string[] | undefined {
  return text.split(',').map((a) => a.trim()) || '';
}

function validationStatusToText(status: boolean): string {
  return status ? 'ok' : 'ng';
}

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
    standardFirmwareEditModel.actions.commitValue(key, value);
  };
}

export const StandardFirmwareEditor_OutputPropsSupplier = {
  get canSave() {
    return standardFirmwareEditModel.readers.canSave;
  },
  emitSavingEditValues() {
    const { editValues } = standardFirmwareEditModel.readers;
    return standardFirmwareEditModelHelpers.cleanupSavingFirmwareConfig(
      editValues,
    );
  },
};

const FieldItem: FC<{ title: string; children: QxChildren }> = ({
  title,
  children,
}) => {
  const styleChildren = css`
    display: flex;
    align-items: center;
    gap: 5px;
  `;
  return (
    <tr>
      <td>{title}</td>
      <td>
        <div css={styleChildren}>{children}</div>
      </td>
    </tr>
  );
};

export const StandardFirmwareEditor: FC<Props> = ({
  firmwareConfig,
  saveHandler,
}) => {
  const {
    constants: { baseFirmwareTypeOptions },
    readers: {
      editValues,
      isAvr,
      isRp,
      availablePinsText,
      rowPinsValid,
      columnPinsValid,
      canSave,
    },
    actions: { loadFirmwareConfig },
  } = standardFirmwareEditModel;

  const onSaveButton = () => {
    saveHandler?.(
      standardFirmwareEditModelHelpers.cleanupSavingFirmwareConfig(editValues),
    );
  };

  useEffect(() => loadFirmwareConfig(firmwareConfig), []);
  return (
    <div css={style}>
      <div>standard firmware configuration</div>
      <table>
        <tbody>
          <FieldItem title="base firmware type">
            <GeneralSelector
              options={baseFirmwareTypeOptions}
              value={editValues.baseFirmwareType}
              setValue={valueChangeHandler('baseFirmwareType')}
            />
          </FieldItem>
          <FieldItem title="use board leds ProMicro" qxIf={isAvr}>
            <ToggleSwitch
              checked={editValues.useBoardLedsProMicroAvr}
              onChange={valueChangeHandler('useBoardLedsProMicroAvr')}
            />
          </FieldItem>
          <FieldItem title="use board leds ProMicro RP2040" qxIf={isRp}>
            <ToggleSwitch
              checked={editValues.useBoardLedsProMicroRp}
              onChange={valueChangeHandler('useBoardLedsProMicroRp')}
            />
          </FieldItem>
          <FieldItem title="use board leds RPi Pico" qxIf={isRp}>
            <ToggleSwitch
              checked={editValues.useBoardLedsRpiPico}
              onChange={valueChangeHandler('useBoardLedsRpiPico')}
            />
          </FieldItem>
          <FieldItem title="row pins">
            <GeneralInput
              value={arrayToText(editValues.matrixRowPins)}
              setValue={valueChangeHandler('matrixRowPins', arrayFromText)}
              width={400}
            />
            <div>{validationStatusToText(rowPinsValid)}</div>
          </FieldItem>

          <FieldItem title="column pins">
            <GeneralInput
              value={arrayToText(editValues.matrixColumnPins)}
              setValue={valueChangeHandler('matrixColumnPins', arrayFromText)}
              width={400}
            />
            <div>{validationStatusToText(columnPinsValid)}</div>
          </FieldItem>
          <FieldItem title="available pins">{availablePinsText}</FieldItem>
        </tbody>
      </table>
      <div qxIf={false}>{JSON.stringify(editValues)}</div>
      <div>
        <button disabled={!canSave} onClick={onSaveButton} qxIf={!!saveHandler}>
          save
        </button>
      </div>
    </div>
  );
};

const style = css`
  table {
    margin-top: 10px;

    td {
      padding: 4px 5px;
    }
  }

  button {
    margin-top: 10px;
    padding: 5px 10px;
  }
`;
