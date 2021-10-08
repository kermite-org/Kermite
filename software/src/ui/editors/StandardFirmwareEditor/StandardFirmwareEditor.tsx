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
import { IStandardFirmwareEditValues } from '~/ui/editors/StandardFirmwareEditor/types';

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
              invalid={!!fieldErrors.matrixRowPins}
            />
            <div className="error">{fieldErrors.matrixRowPins}</div>
          </FieldItem>
          <FieldItem title="column pins" indent>
            <GeneralInput
              value={arrayToText(editValues.matrixColumnPins)}
              setValue={valueChangeHandler('matrixColumnPins', arrayFromText)}
              width={400}
              disabled={!editValues.useMatrixKeyScanner}
              invalid={!!fieldErrors.matrixColumnPins}
            />
            <div className="error">{fieldErrors.matrixColumnPins}</div>
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
              invalid={!!fieldErrors.directWiredPins}
            />
            <div className="error">{fieldErrors.directWiredPins}</div>
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
              width={400}
              disabled={!editValues.useEncoder}
              invalid={!!fieldErrors.encoderPins}
            />
            <div className="error">{fieldErrors.encoderPins}</div>
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
              invalid={!!fieldErrors.lightingPin}
            />
            <div className="error">{fieldErrors.lightingPin}</div>
          </FieldItem>

          <FieldItem title="lighting num LEDs" indent>
            <GeneralInput
              type="number"
              value={integerToText(editValues.lightingNumLeds)}
              setValue={valueChangeHandler(
                'lightingNumLeds',
                integerFromText as any,
              )}
              width={100}
              disabled={!editValues.useLighting}
              invalid={!!fieldErrors.lightingNumLeds}
            />
            <div className="error">{fieldErrors.lightingNumLeds}</div>
          </FieldItem>

          <FieldItem title="use LCD">
            <ToggleSwitch
              checked={editValues.useLcd}
              onChange={valueChangeHandler('useLcd')}
              disabled={isAvr && isSplit}
            />
          </FieldItem>

          <FieldItem title="single wire signal pin" qxIf={isSplit}>
            <GeneralInput
              value={editValues.singleWireSignalPin || ''}
              setValue={valueChangeHandler('singleWireSignalPin')}
              width={100}
              invalid={!!fieldErrors.singleWireSignalPin}
              disabled={!(isSplit && isRp)}
            />
            <div className="error">{fieldErrors.singleWireSignalPin}</div>
          </FieldItem>

          <FieldItem title="use debug uart" qxIf={appUi.isDevelopment}>
            <ToggleSwitch
              checked={editValues.useDebugUart}
              onChange={valueChangeHandler('useDebugUart')}
            />
          </FieldItem>

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
