import { createModal } from '~ui2/views/basis/ForegroundModalLayer';
import { ILayerDefaultScheme } from '~defs/ProfileData';
import { hx } from '~ui2/views/basis/qx';
import { ClosableOverlay } from '~ui2/views/common/basicModals';
import { css } from 'goober';
import {
  reflectFieldValue,
  reflectFieldChecked
} from '~ui2/views/common/FormHelpers';
import {
  CommonDialogFrame,
  DialogContentRow,
  DialogButton,
  DialogButtonsRow
} from '~ui2/views/common/CommonDialogParts';
import {
  cssCommonPropertiesTable,
  cssCommonInput
} from '~ui2/views/common/commonStyles';

interface ILayerConfigurationModelEditValues {
  layerName: string;
  defaultScheme: ILayerDefaultScheme;
  isShiftLayer: boolean;
}

const DefaultSchemeButton = (props: {
  value: ILayerDefaultScheme;
  isCurrent: boolean;
  setCurrent: () => void;
}) => {
  const { value, isCurrent, setCurrent } = props;

  const cssButton = css`
    min-width: 80px;
    height: 26px;
    padding: 0 8px;
    cursor: pointer;
    border: solid 1px #048;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    &[data-current] {
      background: #0cf;
    }
    &:hover {
      opacity: 0.8;
    }
  `;
  return (
    <div css={cssButton} data-current={isCurrent} onClick={setCurrent}>
      {value}
    </div>
  );
};

const LayerConfigurationModalContent = (props: {
  editValues: ILayerConfigurationModelEditValues;
  submit(): void;
  close(): void;
}) => {
  const { editValues, submit, close } = props;
  const defaultSchemeOptions: ILayerDefaultScheme[] = ['block', 'transparent'];
  const cssDefaultSchemeButtonsRow = css`
    display: flex;
  `;

  return (
    <ClosableOverlay close={close}>
      <CommonDialogFrame caption="Layer Properties">
        <DialogContentRow>
          <table css={cssCommonPropertiesTable}>
            <tbody>
              <tr>
                <td>Layer Name</td>
                <td>
                  <input
                    type="text"
                    css={cssCommonInput}
                    value={editValues.layerName}
                    onChange={reflectFieldValue(editValues, 'layerName')}
                  />
                </td>
              </tr>
              <tr>
                <td>Default Scheme</td>
                <td>
                  <div css={cssDefaultSchemeButtonsRow}>
                    {defaultSchemeOptions.map((ds) => (
                      <DefaultSchemeButton
                        key={ds}
                        value={ds}
                        isCurrent={editValues.defaultScheme === ds}
                        setCurrent={() => (editValues.defaultScheme = ds)}
                      />
                    ))}
                  </div>
                </td>
              </tr>
              <tr>
                <td>Attached Modifiers</td>
                <td>
                  <label>
                    <input
                      type="checkbox"
                      checked={editValues.isShiftLayer}
                      onChange={reflectFieldChecked(editValues, 'isShiftLayer')}
                    />
                    <span>shift</span>
                  </label>
                </td>
              </tr>
            </tbody>
          </table>
        </DialogContentRow>
        <DialogButtonsRow>
          <DialogButton onClick={submit}>OK</DialogButton>
        </DialogButtonsRow>
      </CommonDialogFrame>
    </ClosableOverlay>
  );
};

export const callLayerConfigurationModal = createModal(
  (sourceValues: ILayerConfigurationModelEditValues) => {
    const editValues = sourceValues;
    return (props: {
      close: (result: ILayerConfigurationModelEditValues | undefined) => void;
    }) => {
      const submit = () => props.close(editValues);
      const close = () => props.close(undefined);
      return (
        <LayerConfigurationModalContent
          editValues={editValues}
          submit={submit}
          close={close}
        />
      );
    };
  }
);
