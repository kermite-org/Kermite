import { css, FC, jsx, useEffect } from 'qx';
import { GeneralInput, GeneralSelector, ToggleSwitch } from '~/ui/components';
import {
  IFirmwareEditValues,
  firmwareEditModel,
} from '~/ui/features/StandardFirmwareEditor/FirmwareEditModel';
import { firmwareEditModelHelpers } from '~/ui/features/StandardFirmwareEditor/FirmwareEditModel.helpers';

export type Props = {
  firmwareConfig: IFirmwareEditValues;
  saveHandler(firmwareConfig: IFirmwareEditValues): void;
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

function valueChangeHandler<K extends keyof IFirmwareEditValues>(
  key: K,
  converter?: (
    value: Extract<IFirmwareEditValues[K], string | boolean>,
  ) => IFirmwareEditValues[K],
) {
  return (rawValue: Extract<IFirmwareEditValues[K], string | boolean>) => {
    const value = converter ? converter(rawValue) : rawValue;
    firmwareEditModel.actions.commitValue(key, value);
  };
}

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
  } = firmwareEditModel;

  const onSaveButton = () => {
    saveHandler(
      firmwareEditModelHelpers.cleanupSavingFirmwareConfig(editValues),
    );
  };

  useEffect(() => loadFirmwareConfig(firmwareConfig), []);
  return (
    <div css={style}>
      <div>standard firmware configuration</div>
      <table>
        <tbody>
          <tr>
            <td> base firmware type</td>
            <td>
              <GeneralSelector
                options={baseFirmwareTypeOptions}
                value={editValues.baseFirmwareType}
                setValue={valueChangeHandler('baseFirmwareType')}
              />
            </td>
          </tr>
          <tr qxIf={isAvr}>
            <td>use board leds ProMicro</td>
            <td>
              <ToggleSwitch
                checked={editValues.useBoardLedsProMicroAvr}
                onChange={valueChangeHandler('useBoardLedsProMicroAvr')}
              />
            </td>
          </tr>
          <tr qxIf={isRp}>
            <td>use board leds ProMicro RP2040</td>
            <td>
              <ToggleSwitch
                checked={editValues.useBoardLedsProMicroRp}
                onChange={valueChangeHandler('useBoardLedsProMicroRp')}
              />
            </td>
          </tr>
          <tr qxIf={isRp}>
            <td>use board leds RPi Pico</td>
            <td>
              <ToggleSwitch
                checked={editValues.useBoardLedsRpiPico}
                onChange={valueChangeHandler('useBoardLedsRpiPico')}
              />
            </td>
          </tr>
          <tr>
            <td>row pins</td>
            <td>
              <GeneralInput
                value={arrayToText(editValues.matrixRowPins)}
                setValue={valueChangeHandler('matrixRowPins', arrayFromText)}
                width={400}
              />
            </td>
            <td>{validationStatusToText(rowPinsValid)}</td>
          </tr>
          <tr>
            <td>column pins</td>
            <td>
              <GeneralInput
                value={arrayToText(editValues.matrixColumnPins)}
                setValue={valueChangeHandler('matrixColumnPins', arrayFromText)}
                width={400}
              />
            </td>
            <td>{validationStatusToText(columnPinsValid)}</td>
          </tr>
          <tr>
            <td>available pins</td>
            <td>{availablePinsText}</td>
          </tr>
        </tbody>
      </table>
      <div qxIf={false}>{JSON.stringify(editValues)}</div>
      <div>
        <button disabled={!canSave} onClick={onSaveButton}>
          save
        </button>
      </div>
    </div>
  );
};

const style = css`
  margin-top: 20px;

  table {
    margin-top: 10px;

    td {
      padding: 2px 5px;
    }
  }

  button {
    margin-top: 10px;
    padding: 5px 10px;
  }
`;
