import { css, FC, jsx, QxChildren } from 'qx';
import { GeneralInput, GeneralSelector, ToggleSwitch } from '~/ui/components';
import {
  standardFirmwareEditActions,
  standardFirmwareEditStore,
} from '~/ui/features/StandardFirmwareEditor/core';
import { standardFirmwareEditModelHelpers } from '~/ui/features/StandardFirmwareEditor/helpers';
import { useStandardFirmwareEditModel } from '~/ui/features/StandardFirmwareEditor/model';
import { IStandardFirmwareEditValues } from '~/ui/features/StandardFirmwareEditor/types';

export type Props = {
  firmwareConfig: IStandardFirmwareEditValues;
};

function arrayToText(arr: string[] | undefined): string {
  return arr?.join(', ') || '';
}

function arrayFromText(text: string): string[] | undefined {
  if (text === '') {
    return undefined;
  }
  return text.split(',').map((a) => a.trim());
}

function integerFromText(text: string): number | undefined {
  const value = parseInt(text);
  return isFinite(value) ? value : undefined;
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
    standardFirmwareEditActions.commitValue(key, value);
  };
}

export const StandardFirmwareEditor_OutputPropsSupplier = {
  get canSave() {
    const { originalValues, editValues } = standardFirmwareEditStore;
    const isModified = editValues !== originalValues;
    const errors =
      standardFirmwareEditModelHelpers.validateEditValues(editValues);
    const hasError = Object.values(errors).some((a) => !!a);
    const validForSaving =
      standardFirmwareEditModelHelpers.validateForSave(editValues);
    return isModified && !hasError && validForSaving;
  },
  emitSavingEditValues() {
    const { editValues } = standardFirmwareEditStore;
    return standardFirmwareEditModelHelpers.cleanupSavingFirmwareConfig(
      editValues,
    );
  },
};

const FieldItem: FC<{
  title: string;
  children: QxChildren;
  indent?: boolean;
}> = ({ title, children, indent }) => {
  const styleChildren = css`
    display: flex;
    align-items: center;
    gap: 5px;
  `;
  return (
    <tr>
      <td style={(indent && 'padding-left:15px') || ''}>{title}</td>
      <td>
        <div css={styleChildren}>{children}</div>
      </td>
    </tr>
  );
};

export const StandardFirmwareEditor: FC<Props> = ({ firmwareConfig }) => {
  const {
    baseFirmwareTypeOptions,
    editValues,
    isAvr,
    isRp,
    availablePinsText,
    errors,
  } = useStandardFirmwareEditModel(firmwareConfig);

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
          <FieldItem title="use board LEDs ProMicro" qxIf={isAvr}>
            <ToggleSwitch
              checked={editValues.useBoardLedsProMicroAvr}
              onChange={valueChangeHandler('useBoardLedsProMicroAvr')}
            />
          </FieldItem>
          <FieldItem title="use board LEDs ProMicro RP2040" qxIf={isRp}>
            <ToggleSwitch
              checked={editValues.useBoardLedsProMicroRp}
              onChange={valueChangeHandler('useBoardLedsProMicroRp')}
            />
          </FieldItem>
          <FieldItem title="use board LEDs RPi Pico" qxIf={isRp}>
            <ToggleSwitch
              checked={editValues.useBoardLedsRpiPico}
              onChange={valueChangeHandler('useBoardLedsRpiPico')}
            />
          </FieldItem>
          <FieldItem title="use matrix key scanner">
            <ToggleSwitch
              checked={editValues.useMatrixKeyScanner}
              onChange={valueChangeHandler('useMatrixKeyScanner')}
            />
          </FieldItem>
          <FieldItem title="row pins" indent>
            <GeneralInput
              value={arrayToText(editValues.matrixRowPins)}
              setValue={valueChangeHandler('matrixRowPins', arrayFromText)}
              width={400}
              disabled={!editValues.useMatrixKeyScanner}
              invalid={!!errors.matrixRowPins}
            />
            <div>{errors.matrixRowPins}</div>
          </FieldItem>
          <FieldItem title="column pins" indent>
            <GeneralInput
              value={arrayToText(editValues.matrixColumnPins)}
              setValue={valueChangeHandler('matrixColumnPins', arrayFromText)}
              width={400}
              disabled={!editValues.useMatrixKeyScanner}
              invalid={!!errors.matrixColumnPins}
            />
            <div>{errors.matrixColumnPins}</div>
          </FieldItem>

          <FieldItem title="use direct wired key scanner">
            <ToggleSwitch
              checked={editValues.useDirectWiredKeyScanner}
              onChange={valueChangeHandler('useDirectWiredKeyScanner')}
            />
          </FieldItem>
          <FieldItem title="direct wired pins" indent>
            <GeneralInput
              value={arrayToText(editValues.directWiredPins)}
              setValue={valueChangeHandler('directWiredPins', arrayFromText)}
              width={400}
              disabled={!editValues.useDirectWiredKeyScanner}
              invalid={!!errors.directWiredPins}
            />
            <div>{errors.directWiredPins}</div>
          </FieldItem>

          <FieldItem title="use encoder">
            <ToggleSwitch
              checked={editValues.useEncoder}
              onChange={valueChangeHandler('useEncoder')}
            />
          </FieldItem>
          <FieldItem title="encoder pins" indent>
            <GeneralInput
              value={arrayToText(editValues.encoderPins)}
              setValue={valueChangeHandler('encoderPins', arrayFromText)}
              width={100}
              disabled={!editValues.useEncoder}
              invalid={!!errors.encoderPins}
            />
            <div>{errors.encoderPins}</div>
          </FieldItem>

          <FieldItem title="use lighting">
            <ToggleSwitch
              checked={editValues.useLighting}
              onChange={valueChangeHandler('useLighting')}
            />
          </FieldItem>
          <FieldItem title="lighting pin" indent>
            <GeneralInput
              value={editValues.lightingPin || ''}
              setValue={valueChangeHandler('lightingPin')}
              width={100}
              disabled={!(editValues.useLighting && isRp)}
              invalid={!!errors.lightingPin}
            />
            <div>{errors.lightingPin}</div>
          </FieldItem>

          <FieldItem title="lighting num LEDs" indent>
            <GeneralInput
              type="number"
              value={editValues.lightingNumLeds?.toString() || ''}
              setValue={valueChangeHandler(
                'lightingNumLeds',
                integerFromText as any,
              )}
              width={100}
              disabled={!editValues.useLighting}
              invalid={!!errors.lightingNumLeds}
            />
            <div>{errors.lightingNumLeds}</div>
          </FieldItem>

          <FieldItem title="use LCD">
            <ToggleSwitch
              checked={editValues.useLcd}
              onChange={valueChangeHandler('useLcd')}
            />
          </FieldItem>
          <FieldItem title="available pins">{availablePinsText}</FieldItem>
        </tbody>
      </table>
      <div qxIf={false}>{JSON.stringify(editValues)}</div>
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
