import { css, FC, jsx } from 'alumina';
import { IStandardFirmwareConfig } from '~/shared';
import { appUi } from '~/ui/base';
import { GeneralSelector } from '~/ui/components';
import { standardFirmwareEditorComponents } from '~/ui/featureEditors/StandardFirmwareEditor/components';
import { useStandardFirmwareEditPresenter } from '~/ui/featureEditors/StandardFirmwareEditor/presenter';
import { standardFirmwareEditStore } from '~/ui/featureEditors/StandardFirmwareEditor/store';
import { IStandardFirmwareEditValues } from '~/ui/featureEditors/StandardFirmwareEditor/types';

export const StandardFirmwareEditor_ExposedModel = {
  get isValid(): boolean {
    return standardFirmwareEditStore.readers.isValid;
  },
  get isModified(): boolean {
    return standardFirmwareEditStore.readers.isModified;
  },
  get canSave(): boolean {
    return standardFirmwareEditStore.readers.canSave;
  },
  get editValues(): IStandardFirmwareConfig {
    return standardFirmwareEditStore.state.editValues;
  },
  loadFirmwareConfig(
    firmwareConfig: IStandardFirmwareEditValues,
    isNewConfig: boolean,
  ) {
    standardFirmwareEditStore.actions.loadFirmwareConfig(
      firmwareConfig,
      isNewConfig,
    );
  },
};

export const StandardFirmwareEditor: FC = () => {
  const {
    baseFirmwareTypeOptions,
    boardTypeOptions,
    editValues,
    isAvr,
    isRp,
    isSplit,
    isOddSplit,
    isBoardSpecified,
    availablePinsText,
    fieldErrors,
    totalError,
  } = useStandardFirmwareEditPresenter();

  const {
    valueChangeHandler,
    FieldItem,
    ToggleFieldRow,
    IntegerFieldRow,
    SinglePinFieldRow,
    MultiplePinsFieldRow,
  } = standardFirmwareEditorComponents;

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
              width={150}
            />
          </FieldItem>
          <FieldItem title="board type">
            <GeneralSelector
              options={boardTypeOptions}
              value={editValues.boardType}
              setValue={valueChangeHandler('boardType')}
              width={150}
            />
          </FieldItem>
          <ToggleFieldRow
            if={isBoardSpecified}
            label="use board LEDs"
            fieldKey="useBoardLeds"
            editValues={editValues}
          />
          <ToggleFieldRow
            fieldKey="useMatrixKeyScanner"
            label="use matrix key scanner"
            editValues={editValues}
          />
          <MultiplePinsFieldRow
            label="column pins"
            fieldKey="matrixColumnPins"
            availabilityKey="useMatrixKeyScanner"
            editValues={editValues}
            fieldErrors={fieldErrors}
          />
          <MultiplePinsFieldRow
            label="row pins"
            fieldKey="matrixRowPins"
            availabilityKey="useMatrixKeyScanner"
            editValues={editValues}
            fieldErrors={fieldErrors}
          />
          <MultiplePinsFieldRow
            label="column pins right"
            fieldKey="matrixColumnPinsR"
            availabilityKey="useMatrixKeyScanner"
            editValues={editValues}
            fieldErrors={fieldErrors}
            if={isOddSplit}
          />
          <MultiplePinsFieldRow
            label="row pins right"
            fieldKey="matrixRowPinsR"
            availabilityKey="useMatrixKeyScanner"
            editValues={editValues}
            fieldErrors={fieldErrors}
            if={isOddSplit}
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
            if={isOddSplit}
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
            if={isOddSplit}
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
            if={isOddSplit}
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
            if={isSplit}
          />

          <ToggleFieldRow
            fieldKey="useDebugUart"
            label="use debug uart"
            editValues={editValues}
            if={appUi.isDevelopment}
          />

          <FieldItem title="available pins">{availablePinsText}</FieldItem>
        </tbody>
      </table>
      <div className="total-error" if={!!totalError}>
        {totalError}
      </div>
      <div if={false}>{JSON.stringify(editValues)}</div>
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
